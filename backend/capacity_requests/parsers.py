"""Stage 4B: natural-language → structured suggestion.

ARCHITECTURE (the AI is an assistant, never the source of truth):

    user text → parser → suggestion dict → sanitization → frontend
    confirmation → CapacityRequestSerializer validation → database

Providers:
- If AI_API_KEY is set (backend/.env), call an OpenAI-compatible chat
  completions endpoint through Django — the key never reaches React.
- Otherwise (or on any provider error) use the deterministic rule-based
  fallback parser so the demo works offline.

sanitize_suggestion() runs on BOTH provider outputs: unknown categories,
bad dates/times, non-positive capacity etc. are dropped with a warning.
Nothing here ever writes to the database — creation goes through the
existing POST /api/requests/ serializer.
"""

import json
import os
import re
import urllib.error
import urllib.request
from datetime import date, datetime, time, timedelta

from resources.models import ResourceCategory

# ---------------------------------------------------------------------------
# Deterministic fallback parser
# ---------------------------------------------------------------------------

CATEGORY_KEYWORDS = [
    # (category, keywords) — evaluated in order; first hit wins.
    (
        ResourceCategory.EQUIPMENT,
        ["projector", "equipment", "tool", "machine", "generator",
         "sound system", "microphone", "laptop", "printer"],
    ),
    (
        ResourceCategory.TRANSPORTATION,
        ["carton", "move", "move to", "transport", "vehicle", "seat",
         "deliver", "delivery", "cargo", "truck", "bus", "ride", "convey"],
    ),
    (
        ResourceCategory.STORAGE,
        ["storage", "store", "warehouse", "container", "boxes", "box"],
    ),
    (
        ResourceCategory.SPACE,
        ["classroom", "hall", "room", "venue", "space", "studio", "office",
         "meeting", "conference", "training", "event", "coworking",
         "community", "sports", "party", "wedding"],
    ),
]

STOPWORDS = {
    "from", "tomorrow", "today", "on", "for", "with", "and", "the", "a", "an",
    "to", "at", "by", "next", "this", "pm", "am", "need", "require", "required",
}

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday",
            "saturday", "sunday"]

UNITS = ("people", "person", "pax", "men", "cartons", "carton", "boxes",
         "box", "items", "item", "seats", "seat", "units", "unit",
         "pieces", "piece", "bags", "bag", "litres", "tonnes", "tons")


def _detect_category(text):
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS:
        for kw in keywords:
            if kw in lowered:
                return category
    return None


def _detect_capacity(text):
    # "20 people", "10 cartons", "30 boxes", "for 20 pax"
    units = "|".join(UNITS)
    m = re.search(rf"(\d+)\s*(?:{units})\b", text, re.IGNORECASE)
    if not m:
        m = re.search(rf"\bfor\s+(\d+)\b", text, re.IGNORECASE)
    if not m:
        m = re.search(r"\b(\d+)\b", text)
    if not m:
        return None
    value = int(m.group(1))
    return value if value > 0 else None


def _detect_location(text, category):
    # Transportation: destination after "to" wins ("from Ota to Ikeja").
    if category == ResourceCategory.TRANSPORTATION:
        m = re.search(r"\bto\s+([A-Za-z][\w'-]*(?:\s+[A-Za-z][\w'-]*){0,2})",
                      text, re.IGNORECASE)
        if m:
            return _clean_place(m.group(1))
    m = re.search(
        r"\b(?:in|around|near|at)\s+([A-Za-z][\w'-]*(?:\s+[A-Za-z][\w'-]*){0,2})",
        text, re.IGNORECASE,
    )
    if m:
        return _clean_place(m.group(1))
    return None


def _clean_place(candidate):
    words = [w for w in candidate.split() if w.lower() not in STOPWORDS]
    return " ".join(words[:3]).strip(",. ") or None


def _to_12h(hour, minute, meridiem):
    hour = int(hour)
    minute = int(minute or 0)
    meridiem = (meridiem or "").lower()
    if meridiem == "pm" and hour < 12:
        hour += 12
    if meridiem == "am" and hour == 12:
        hour = 0
    if 0 <= hour <= 23 and 0 <= minute <= 59:
        return time(hour, minute)
    return None


def _detect_times(text):
    # "10am to 4pm", "2pm - 8pm", "10:00 until 16:00", "from 10am to 4pm"
    m = re.search(
        r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to|till|until|–|—)\s*"
        r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?",
        text, re.IGNORECASE,
    )
    if not m:
        return None, None
    h1, min1, mer1, h2, min2, mer2 = m.groups()
    # If only one meridiem given, assume it applies to both (10am to 4 → 4pm
    # stays unknown; treat missing as same meridiem, else 24h).
    if mer1 and not mer2:
        mer2 = mer1
    start = _to_12h(h1, min1, mer1)
    end = _to_12h(h2, min2, mer2)
    return start, end


def _detect_date(text):
    lowered = text.lower()
    today = date.today()
    if re.search(r"\btomorrow\b", lowered):
        return today + timedelta(days=1)
    if re.search(r"\btoday\b", lowered):
        return today
    m = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", text)
    if m:
        try:
            return date.fromisoformat(m.group(1))
        except ValueError:
            pass
    for idx, day in enumerate(WEEKDAYS):
        if re.search(rf"\b{day}\b", lowered):
            delta = (idx - today.weekday()) % 7
            delta = delta or 7  # next occurrence, never today
            return today + timedelta(days=delta)
    if "next week" in lowered:
        return today + timedelta(days=7)
    return None


def _detect_purpose(text):
    m = re.search(
        r"\bfor\s+(?!number\b|\d)([A-Za-z][^.,;!?]{2,60})", text, re.IGNORECASE
    )
    if not m:
        return None
    candidate = m.group(1).strip()
    # Cut trailing clauses like "for a birthday event in Ikeja".
    candidate = re.split(r"\s+(?:in|around|at|on|from)\s+", candidate,
                         maxsplit=1, flags=re.IGNORECASE)[0]
    return candidate or None


def _detect_requirements(text):
    m = re.search(
        r"\b(?:must have|with|needs?)\s+([A-Za-z][^.,;!?]{2,60})",
        text, re.IGNORECASE,
    )
    if not m:
        return None
    return m.group(1).strip() or None


def _detect_resource_type(text, category):
    """Map common nouns to a tidy resource_type label."""
    lowered = text.lower()
    labels = {
        "classroom": "classroom", "hall": "hall", "room": "room",
        "venue": "venue", "studio": "studio", "office": "office",
        "warehouse": "warehouse", "container": "container",
        "projector": "projector", "vehicle": "vehicle", "truck": "truck",
        "seat": "seat", "seats": "seat", "meeting": "meeting room",
        "training": "training room", "conference": "conference room",
        "event": "event space",
    }
    for word, label in labels.items():
        if re.search(rf"\b{word}\b", lowered):
            return label
    defaults = {
        ResourceCategory.SPACE: "space",
        ResourceCategory.STORAGE: "storage",
        ResourceCategory.TRANSPORTATION: "transport",
        ResourceCategory.EQUIPMENT: "equipment",
    }
    return defaults.get(category)


def fallback_parse(text):
    """Rule-based suggestion. Never raises; returns only confident fields."""
    suggestion = {}
    category = _detect_category(text)
    if category:
        suggestion["category"] = category
    capacity = _detect_capacity(text)
    if capacity:
        suggestion["capacity_required"] = capacity
    location = _detect_location(text, category)
    if location:
        suggestion["location"] = location
    start, end = _detect_times(text)
    if start:
        suggestion["start_time"] = start.strftime("%H:%M")
    if end:
        suggestion["end_time"] = end.strftime("%H:%M")
    when = _detect_date(text)
    if when:
        suggestion["date"] = when.isoformat()
    purpose = _detect_purpose(text)
    if purpose:
        suggestion["purpose"] = purpose
    requirements = _detect_requirements(text)
    if requirements:
        suggestion["requirements"] = requirements
    rtype = _detect_resource_type(text, category)
    if rtype:
        suggestion["resource_type"] = rtype
    return suggestion


# ---------------------------------------------------------------------------
# Optional AI provider (backend only)
# ---------------------------------------------------------------------------

AI_SYSTEM_PROMPT = """You extract structured capacity-request fields from text.
Reply with ONLY a JSON object using these optional keys:
category (one of: transportation, storage, space, equipment),
resource_type (short string), location (short place string),
capacity_required (positive integer), date (YYYY-MM-DD),
start_time (HH:MM), end_time (HH:MM), purpose (short string),
requirements (short string). Omit keys you cannot infer. No prose."""


def ai_parse(text):
    """Call an OpenAI-compatible provider. Returns dict or raises."""
    api_key = (
        os.environ.get("AI_API_KEY", "").strip()
        # Common alias; accept it so existing deployments keep working.
        or os.environ.get("OPENAI_API_KEY", "").strip()
    )
    if not api_key:
        raise RuntimeError("AI_API_KEY not configured")
    base = os.environ.get("AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("AI_MODEL", "gpt-4o-mini")
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": AI_SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        f"{base}/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {api_key}"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode())
    content = body["choices"][0]["message"]["content"]
    return json.loads(content)


# ---------------------------------------------------------------------------
# Sanitization — applied to EVERY provider output (AI and fallback)
# ---------------------------------------------------------------------------

VALID_CATEGORIES = {c.value for c in ResourceCategory}


def sanitize_suggestion(raw, original_text=""):
    """Coerce a provider dict into a safe suggestion. Never raises.

    Returns (suggestion, warnings, source). Invalid fields are dropped and
    reported so the frontend can flag them for the user.
    """
    warnings = []
    clean = {}
    if not isinstance(raw, dict):
        return {"original_text": original_text}, ["Parser returned no data."], None

    category = str(raw.get("category", "")).strip().lower()
    if category:
        if category in VALID_CATEGORIES:
            clean["category"] = category
        else:
            warnings.append(f"Unknown category '{category}' ignored.")

    if "resource_type" in raw and raw["resource_type"]:
        clean["resource_type"] = str(raw["resource_type"])[:100]

    location = str(raw.get("location", "") or "").strip()
    if location:
        clean["location"] = location[:255]

    cap = raw.get("capacity_required")
    if cap is not None:
        try:
            cap_int = int(cap)
            if cap_int > 0:
                clean["capacity_required"] = cap_int
            else:
                warnings.append("Capacity must be positive; ignored.")
        except (TypeError, ValueError):
            warnings.append("Could not read capacity; ignored.")

    d = raw.get("date")
    if d:
        try:
            if isinstance(d, date):
                clean["date"] = d.isoformat()
            else:
                clean["date"] = date.fromisoformat(str(d)).isoformat()
        except ValueError:
            warnings.append(f"Could not read date '{d}'; ignored.")

    for key in ("start_time", "end_time"):
        t = raw.get(key)
        if t:
            try:
                parsed = (t if isinstance(t, time)
                          else datetime.strptime(str(t)[:5], "%H:%M").time())
                clean[key] = parsed.strftime("%H:%M")
            except ValueError:
                warnings.append(f"Could not read {key}; ignored.")

    if "start_time" in clean and "end_time" in clean:
        if clean["start_time"] >= clean["end_time"]:
            warnings.append("End time is not after start time; both ignored.")
            clean.pop("start_time", None)
            clean.pop("end_time", None)

    for key, limit in (("purpose", 255), ("requirements", 1000)):
        val = str(raw.get(key, "") or "").strip()
        if val:
            clean[key] = val[:limit]

    return clean, warnings, None


def parse_request_text(text):
    """Main entry: try AI (if configured), fall back, always sanitize."""
    text = (text or "").strip()
    if not text:
        return {"original_text": "", "suggestion": {},
                "warnings": ["Empty request text."], "parser": None}
    source = "fallback"
    raw = None
    try:
        raw = ai_parse(text)
        source = "ai"
    except Exception:  # noqa: BLE001 — any provider failure → fallback
        raw = None
    if not isinstance(raw, dict) or not raw:
        raw = fallback_parse(text)
        source = "fallback"
    suggestion, warnings, _ = sanitize_suggestion(raw, text)
    suggestion["original_text"] = text
    return {"original_text": text, "suggestion": suggestion,
            "warnings": warnings, "parser": source}
