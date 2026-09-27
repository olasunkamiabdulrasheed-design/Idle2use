"""Stage 4 tests: CapacityRequest CRUD, ownership, validation, lifecycle."""

from datetime import date, timedelta

from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from capacity_requests.models import CapacityRequest, RequestStatus
from capacity_requests.parsers import fallback_parse, sanitize_suggestion

PASSWORD = "StrongPassword123!"

REQUEST_BODY = {
    "category": "space",
    "resource_type": "classroom",
    "location": "Ikeja",
    "capacity_required": 20,
    "date": "2026-10-06",
    "start_time": "10:00",
    "end_time": "16:00",
    "purpose": "Work / Meeting",
    "requirements": "Must have whiteboard",
    "original_text": "I need a classroom for 20 people in Ikeja tomorrow from 10am to 4pm.",
}


def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


class CapacityRequestTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="john", email="john@example.com", password=PASSWORD
        )
        self.other = User.objects.create_user(
            username="sarah", email="sarah@example.com", password=PASSWORD
        )
        self.owner_client = auth_client(self.owner)
        self.other_client = auth_client(self.other)

    def create_request(self, client=None, **overrides):
        client = client or self.owner_client
        return client.post(
            "/api/requests/", {**REQUEST_BODY, **overrides}, format="json"
        )

    # -- 1. authenticated create ------------------------------------------
    def test_01_authenticated_user_can_create_request(self):
        res = self.create_request()
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data["requester"], self.owner.id)
        self.assertEqual(res.data["requester_username"], "john")
        self.assertEqual(res.data["status"], "active")
        self.assertEqual(
            res.data["original_text"], REQUEST_BODY["original_text"]
        )
        self.assertTrue(CapacityRequest.objects.filter(pk=res.data["id"]).exists())

    # -- 2. unauthenticated create ------------------------------------------
    def test_02_unauthenticated_user_cannot_create_request(self):
        res = self.client.post("/api/requests/", REQUEST_BODY, format="json")
        self.assertEqual(res.status_code, 401)

    # -- 3. list returns only own requests ------------------------------------
    def test_03_list_returns_only_own_requests(self):
        own = self.create_request().data["id"]
        theirs = self.create_request(
            client=self.other_client, location="Lekki"
        ).data["id"]
        res = self.owner_client.get("/api/requests/")
        ids = [r["id"] for r in res.data]
        self.assertIn(own, ids)
        self.assertNotIn(theirs, ids)

    # -- 4. owner can retrieve --------------------------------------------------
    def test_04_owner_can_retrieve_request(self):
        created = self.create_request().data
        res = self.owner_client.get(f"/api/requests/{created['id']}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["location"], "Ikeja")

    # -- 5. another user cannot retrieve (404, existence hidden) ------------------
    def test_05_another_user_cannot_retrieve_request(self):
        created = self.create_request().data
        res = self.other_client.get(f"/api/requests/{created['id']}/")
        self.assertEqual(res.status_code, 404)

    # -- 6. owner can update fields ------------------------------------------------
    def test_06_owner_can_update_request(self):
        created = self.create_request().data
        res = self.owner_client.patch(
            f"/api/requests/{created['id']}/",
            {"location": "Yaba", "capacity_required": 30},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["location"], "Yaba")
        self.assertEqual(res.data["capacity_required"], 30)

    # -- 7. owner can cancel (valid transition) --------------------------------------
    def test_07_owner_can_cancel_request(self):
        created = self.create_request().data
        res = self.owner_client.patch(
            f"/api/requests/{created['id']}/", {"status": "cancelled"}, format="json"
        )
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.data["status"], "cancelled")

    # -- 8. invalid status transition rejected -------------------------------------------
    def test_08_invalid_status_transition_rejected(self):
        created = self.create_request().data
        self.owner_client.patch(
            f"/api/requests/{created['id']}/", {"status": "cancelled"}, format="json"
        )
        res = self.owner_client.patch(
            f"/api/requests/{created['id']}/", {"status": "active"}, format="json"
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("status", res.data)
        self.assertEqual(
            CapacityRequest.objects.get(pk=created["id"]).status, "cancelled"
        )

    # -- 9. start/end validation ----------------------------------------------------------
    def test_09_invalid_time_range_rejected(self):
        res = self.create_request(start_time="16:00", end_time="10:00")
        self.assertEqual(res.status_code, 400)
        self.assertIn("end_time", res.data)

    # -- 10. invalid category rejected ---------------------------------------------------
    def test_10_invalid_category_rejected(self):
        res = self.create_request(category="spaceships")
        self.assertEqual(res.status_code, 400)
        self.assertIn("category", res.data)

    # -- 11. capacity must be positive ----------------------------------------------------
    def test_11_capacity_must_be_positive(self):
        res = self.create_request(capacity_required=0)
        self.assertEqual(res.status_code, 400)
        self.assertIn("capacity_required", res.data)

    # -- 12. owner can delete ---------------------------------------------------------------
    def test_12_owner_can_delete_request(self):
        created = self.create_request().data
        res = self.owner_client.delete(f"/api/requests/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(CapacityRequest.objects.filter(pk=created["id"]).exists())

    # -- 13. another user cannot delete / modify ------------------------------------------------
    def test_13_another_user_cannot_delete_or_modify_request(self):
        created = self.create_request().data
        self.assertEqual(
            self.other_client.delete(f"/api/requests/{created['id']}/").status_code, 404
        )
        self.assertEqual(
            self.other_client.patch(
                f"/api/requests/{created['id']}/", {"location": "Ota"}, format="json"
            ).status_code,
            404,
        )
        self.assertEqual(
            CapacityRequest.objects.get(pk=created["id"]).location, "Ikeja"
        )

    # -- 14. status filtering ------------------------------------------------------------------
    def test_14_status_filtering_works(self):
        active = self.create_request().data
        cancelled = self.create_request(location="Yaba").data
        self.owner_client.patch(
            f"/api/requests/{cancelled['id']}/", {"status": "cancelled"}, format="json"
        )
        res = self.owner_client.get("/api/requests/?status=cancelled")
        ids = [r["id"] for r in res.data]
        self.assertIn(cancelled["id"], ids)
        self.assertNotIn(active["id"], ids)

    # -- 15. natural-language original is preserved -------------------------------------------------
    def test_15_original_text_is_preserved(self):
        created = self.create_request().data
        stored = CapacityRequest.objects.get(pk=created["id"])
        self.assertEqual(stored.original_text, REQUEST_BODY["original_text"])
        # No structured data yet in Stage 4 (parser arrives in 4B).
        self.assertIsNone(stored.structured_data)


class ParseRequestTests(APITestCase):
    """Stage 4B: NL parsing endpoint + fallback parser + sanitization."""

    DEMO = "I need a classroom for 20 people in Ikeja tomorrow from 10am to 4pm."

    def setUp(self):
        self.user = User.objects.create_user(
            username="parser", email="parser@example.com", password=PASSWORD
        )
        self.client_auth = auth_client(self.user)

    def parse(self, text, client=None):
        client = client or self.client_auth
        return client.post("/api/requests/parse/", {"text": text}, format="json")

    def test_p1_parse_requires_authentication(self):
        res = self.client.post(
            "/api/requests/parse/", {"text": self.DEMO}, format="json"
        )
        self.assertEqual(res.status_code, 401)

    def test_p2_parse_rejects_too_short_text(self):
        res = self.parse("hi")
        self.assertEqual(res.status_code, 400)

    def test_p3_fallback_parses_demo_sentence(self):
        res = self.parse(self.DEMO)
        self.assertEqual(res.status_code, 200, res.content)
        data = res.data
        self.assertEqual(data["original_text"], self.DEMO)
        s = data["suggestion"]
        self.assertEqual(s["category"], "space")
        self.assertEqual(s["resource_type"], "classroom")
        self.assertEqual(s["location"], "Ikeja")
        self.assertEqual(s["capacity_required"], 20)
        self.assertEqual(s["start_time"], "10:00")
        self.assertEqual(s["end_time"], "16:00")
        expected = (date.today() + timedelta(days=1)).isoformat()
        self.assertEqual(s["date"], expected)
        self.assertEqual(data["parser"], "fallback")

    def test_p4_suggestion_creates_valid_request(self):
        s = self.parse(self.DEMO).data["suggestion"]
        res = self.client_auth.post("/api/requests/", s, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        stored = CapacityRequest.objects.get(pk=res.data["id"])
        self.assertEqual(stored.original_text, self.DEMO)

    def test_p5_sanitization_drops_invalid_fields(self):
        clean, warnings, _ = sanitize_suggestion(
            {"category": "spaceships", "capacity_required": -5,
             "date": "not-a-date", "start_time": "25:99",
             "location": "Ikeja"}
        )
        self.assertNotIn("category", clean)
        self.assertNotIn("capacity_required", clean)
        self.assertNotIn("date", clean)
        self.assertNotIn("start_time", clean)
        self.assertEqual(clean["location"], "Ikeja")
        self.assertTrue(warnings)

    def test_p6_sanitization_drops_inverted_times(self):
        clean, warnings, _ = sanitize_suggestion(
            {"start_time": "16:00", "end_time": "10:00"}
        )
        self.assertNotIn("start_time", clean)
        self.assertNotIn("end_time", clean)
        self.assertTrue(any("End time" in w for w in warnings))

    def test_p7_fallback_detects_other_categories(self):
        self.assertEqual(
            fallback_parse("I need a projector for 30 people tomorrow "
                           "from 2pm to 6pm")["category"],
            "equipment",
        )
        self.assertEqual(
            fallback_parse("I need somewhere to store 30 boxes in Ikeja "
                           "for two weeks")["category"],
            "storage",
        )
        self.assertEqual(
            fallback_parse("I need to move 10 cartons from Ota to Ikeja "
                           "tomorrow morning")["category"],
            "transportation",
        )
