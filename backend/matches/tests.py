"""Stage 5 tests: matching engine gates, scoring, persistence, hooks."""

from datetime import date, time, timedelta

from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from capacity_requests.models import CapacityRequest
from matches.models import Match
from matches.services import find_matches, score_candidate
from resources.models import Availability, Resource

PASSWORD = "StrongPassword123!"
WHEN = date.today() + timedelta(days=3)


def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


def make_request(user, **overrides):
    data = {
        "requester": user,
        "category": "space",
        "resource_type": "classroom",
        "location": "Ikeja",
        "capacity_required": 20,
        "date": WHEN,
        "start_time": time(10, 0),
        "end_time": time(16, 0),
        "purpose": "Work",
        "requirements": "",
        "original_text": "classroom for 20 in Ikeja",
    }
    data.update(overrides)
    return CapacityRequest.objects.create(**data)


def make_resource(owner, **overrides):
    data = {
        "owner": owner,
        "category": "space",
        "name": "Ikeja Training Hub",
        "description": "Bright training room with projector",
        "location": "Ikeja, Lagos",
        "capacity": 40,
        "capacity_unit": "people",
        "status": "active",
    }
    data.update(overrides)
    return Resource.objects.create(**data)


def cover(resource, day=WHEN, start=time(9, 0), end=time(18, 0), status="available"):
    return Availability.objects.create(
        resource=resource, date=day, start_time=start, end_time=end, status=status
    )


class ScoringEngineTests(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(
            username="prov", email="p@x.com", password=PASSWORD)
        self.requester = User.objects.create_user(
            username="req", email="r@x.com", password=PASSWORD)
        self.req = make_request(self.requester)

    def test_gate_rejects_wrong_category(self):
        r = make_resource(self.provider, category="storage")
        cover(r)
        self.assertIsNone(score_candidate(self.req, r))

    def test_gate_rejects_inactive_resource(self):
        r = make_resource(self.provider, status="inactive")
        cover(r)
        self.assertIsNone(score_candidate(self.req, r))

    def test_gate_rejects_missing_availability(self):
        r = make_resource(self.provider)
        self.assertIsNone(score_candidate(self.req, r))

    def test_gate_rejects_partial_time_coverage(self):
        r = make_resource(self.provider)
        cover(r, start=time(12, 0), end=time(14, 0))  # doesn't cover 10-16
        self.assertIsNone(score_candidate(self.req, r))

    def test_gate_rejects_insufficient_capacity(self):
        r = make_resource(self.provider, capacity=10)
        cover(r)
        self.assertIsNone(score_candidate(self.req, r))

    def test_gate_rejects_unavailable_slot_status(self):
        r = make_resource(self.provider)
        cover(r, status="unavailable")
        self.assertIsNone(score_candidate(self.req, r))

    def test_good_match_scores_and_explains(self):
        r = make_resource(self.provider)
        cover(r)
        score, reasons = score_candidate(self.req, r)
        self.assertGreaterEqual(score, 80)
        self.assertTrue(any("Location" in x for x in reasons))
        self.assertTrue(any("Available" in x for x in reasons))
        self.assertTrue(any("Capacity" in x for x in reasons))

    def test_find_matches_sorts_by_score(self):
        weak = make_resource(self.provider, name="Far Hall", location="Ota, Ogun")
        cover(weak)
        strong = make_resource(self.provider, name="Ikeja Classroom")
        cover(strong)
        results = find_matches(self.req)
        self.assertEqual(len(results), 2)
        self.assertGreaterEqual(results[0][1], results[1][1])


class MatchingApiTests(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(
            username="prov", email="p@x.com", password=PASSWORD)
        self.requester = User.objects.create_user(
            username="req", email="r@x.com", password=PASSWORD)
        self.other = User.objects.create_user(
            username="other", email="o@x.com", password=PASSWORD)
        self.req = make_request(self.requester)
        self.resource = make_resource(self.provider)
        cover(self.resource)
        self.req_client = auth_client(self.requester)
        self.other_client = auth_client(self.other)

    def test_run_matching_persists_and_dedupes(self):
        res = self.req_client.post(f"/api/requests/{self.req.pk}/matches/")
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(Match.objects.filter(request=self.req).count(), 1)
        # Running again must not duplicate the same (request, resource) row.
        self.req_client.post(f"/api/requests/{self.req.pk}/matches/")
        self.assertEqual(Match.objects.filter(request=self.req).count(), 1)

    def test_non_requester_cannot_run_or_read(self):
        self.assertEqual(
            self.other_client.post(f"/api/requests/{self.req.pk}/matches/").status_code,
            403,
        )
        self.assertEqual(
            self.other_client.get(f"/api/requests/{self.req.pk}/matches/").status_code,
            403,
        )

    def test_matches_list_scoped_to_requester(self):
        self.req_client.post(f"/api/requests/{self.req.pk}/matches/")
        res = self.req_client.get("/api/matches/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(self.other_client.get("/api/matches/").data, [])

    def test_provider_role_sees_matches_on_own_resources(self):
        self.req_client.post(f"/api/requests/{self.req.pk}/matches/")
        prov_client = auth_client(self.provider)
        res = prov_client.get("/api/matches/?role=provider")
        self.assertEqual(len(res.data), 1)
        res2 = self.req_client.get("/api/matches/?role=provider")
        self.assertEqual(res2.data, [])

    def test_match_status_can_be_dismissed(self):
        self.req_client.post(f"/api/requests/{self.req.pk}/matches/")
        match_id = Match.objects.get(request=self.req).pk
        res = self.req_client.patch(
            f"/api/matches/{match_id}/", {"status": "dismissed"}, format="json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "dismissed")


class PersistentRequestHookTests(APITestCase):
    """Provider adds capacity later → active request gains matches (signals)."""

    def setUp(self):
        self.provider = User.objects.create_user(
            username="prov", email="p@x.com", password=PASSWORD)
        self.requester = User.objects.create_user(
            username="req", email="r@x.com", password=PASSWORD)
        self.req = make_request(self.requester)

    def test_new_resource_creates_match_for_active_request(self):
        self.assertEqual(Match.objects.count(), 0)
        r = make_resource(self.provider)  # signal should fire
        cover(r)  # availability save → signal re-runs
        self.assertEqual(Match.objects.filter(request=self.req).count(), 1)

    def test_later_availability_creates_match(self):
        r = make_resource(self.provider)  # no availability yet
        self.assertEqual(Match.objects.count(), 0)
        cover(r)
        self.assertEqual(Match.objects.filter(request=self.req).count(), 1)

    def test_cancelled_request_not_matched(self):
        self.req.status = "cancelled"
        self.req.save()
        r = make_resource(self.provider)
        cover(r)
        self.assertEqual(Match.objects.count(), 0)
