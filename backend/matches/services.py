"""Stage 5: MatchingService — the core Idle2Use matching engine.

Pipeline (per the architecture):
    CapacityRequest → candidate Resource query → Availability query →
    compatibility evaluation → scored Match rows

Scoring weights (configurable via WEIGHTS):
    location 30% | time 25% | capacity 20% | resource type 15% | requirements 10%

HARD GATES (a candidate must pass all to be a match at all):
    1. resource is active
    2. category matches exactly
    3. an AVAILABLE slot covers the requested date AND time window
    4. capacity >= capacity_required

The score is an application matching score for UX — reasons are the
source of truth about WHY something matched.
"""

from .models import Match

WEIGHTS = {
    "location": 0.30,
    "time": 0.25,
    "capacity": 0.20,
    "resource_type": 0.15,
    "requirements": 0.10,
}


def _location_score(request, resource):
    req = (request.location or "").strip().lower()
    res = (resource.location or "").strip().lower()
    if not req or not res:
        return 1.0, "Location not specified"
    if req == res:
        return 1.0, "Location matches exactly"
    req_tokens = set(req.replace(",", " ").split())
    res_tokens = set(res.replace(",", " ").split())
    if req_tokens and req_tokens <= res_tokens:
        return 1.0, f"Location matches ({resource.location})"
    if req_tokens & res_tokens:
        return 0.6, f"Nearby location ({resource.location})"
    return 0.0, "Different location"


def _time_score(request, resource):
    slot = (
        resource.availabilities.filter(
            date=request.date,
            status="available",
            start_time__lte=request.start_time,
            end_time__gte=request.end_time,
        )
        .order_by("start_time")
        .first()
    )
    if slot is None:
        return 0.0, None  # hard gate failure
    return 1.0, (
        f"Available {request.date.strftime('%b %d')} "
        f"{slot.start_time.strftime('%H:%M')}-{slot.end_time.strftime('%H:%M')}"
    )


def _capacity_score(request, resource):
    if resource.capacity < request.capacity_required:
        return 0.0, None  # hard gate failure
    if resource.capacity == request.capacity_required:
        return 0.9, "Capacity is sufficient"
    return 1.0, f"Capacity is sufficient ({resource.capacity} ≥ {request.capacity_required})"


def _resource_type_score(request, resource):
    wanted = (request.resource_type or "").strip().lower()
    if not wanted:
        return 1.0, None  # nothing to check — neutral
    haystack = " ".join(
        [resource.name, resource.description, resource.get_category_display()]
    ).lower()
    if wanted in haystack:
        return 1.0, f"Resource type matches ({request.resource_type})"
    # Partial: any word of the wanted type appears.
    words = [w for w in wanted.split() if len(w) > 3]
    if any(w in haystack for w in words):
        return 0.6, "Resource type partially matches"
    return 0.2, None


def _requirements_score(request, resource):
    req_text = (request.requirements or "").strip().lower()
    if not req_text:
        return 1.0, None  # nothing required — neutral
    haystack = " ".join(
        [resource.name, resource.description, resource.capacity_unit]
    ).lower()
    wanted = [w for w in req_text.replace(",", " ").split() if len(w) > 3]
    if not wanted:
        return 1.0, None
    hits = [w for w in wanted if w in haystack]
    if len(hits) == len(wanted):
        return 1.0, "Requirements satisfied"
    if hits:
        return 0.5, None
    return 0.0, None


def score_candidate(request, resource):
    """Return (score:int, reasons:list) or None when a hard gate fails."""
    if resource.status != "active":
        return None
    if resource.category != request.category:
        return None
    time_score, time_reason = _time_score(request, resource)
    if time_score == 0.0:
        return None
    cap_score, cap_reason = _capacity_score(request, resource)
    if cap_score == 0.0:
        return None
    loc_score, loc_reason = _location_score(request, resource)
    type_score, type_reason = _resource_type_score(request, resource)
    req_score, req_reason = _requirements_score(request, resource)

    total = (
        loc_score * WEIGHTS["location"]
        + time_score * WEIGHTS["time"]
        + cap_score * WEIGHTS["capacity"]
        + type_score * WEIGHTS["resource_type"]
        + req_score * WEIGHTS["requirements"]
    )
    score = round(total * 100)
    reasons = [r for r in (loc_reason, time_reason, cap_reason, type_reason,
                           req_reason) if r]
    return score, reasons


def find_matches(request, limit=50):
    """Score every active resource of the right category against a request."""
    from resources.models import Resource  # local import avoids app-load cycle
    results = []
    candidates = Resource.objects.filter(
        status="active", category=request.category
    ).select_related("owner")
    for resource in candidates:
        outcome = score_candidate(request, resource)
        if outcome is not None:
            results.append((resource, *outcome))
    results.sort(key=lambda item: item[1], reverse=True)
    return results[:limit]


def run_matching_for_request(request):
    """Persist matches for one request; drop rows that no longer qualify."""
    current = find_matches(request)
    kept_ids = set()
    for resource, score, reasons in current:
        match, _ = Match.objects.update_or_create(
            request=request,
            resource=resource,
            defaults={"score": score, "reasons": reasons},
        )
        kept_ids.add(match.pk)
    Match.objects.filter(request=request).exclude(pk__in=kept_ids).delete()
    return Match.objects.filter(request=request).order_by("-score")


def run_matching_for_resource(resource):
    """Persistent-request hook: provider changed capacity → re-check requests.

    Called from signals whenever a Resource or Availability is saved.
    Synchronous by design (hackathon MVP — no Celery/Redis needed).
    """
    from capacity_requests.models import CapacityRequest, RequestStatus

    if resource.status != "active":
        return 0
    requests = CapacityRequest.objects.filter(
        status=RequestStatus.ACTIVE, category=resource.category
    )
    updated = 0
    for request in requests:
        before = set(
            Match.objects.filter(request=request).values_list("pk", flat=True)
        )
        run_matching_for_request(request)
        after = set(
            Match.objects.filter(request=request).values_list("pk", flat=True)
        )
        if after - before:
            updated += 1
    return updated