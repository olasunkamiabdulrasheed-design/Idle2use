"""Stage 3 tests: Resource CRUD + ownership + Availability rules + filtering."""

from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from resources.models import Availability, Resource

PASSWORD = "StrongPassword123!"

RESOURCE = {
    "category": "space",
    "name": "Ikeja Conference Room",
    "description": "Meeting and training room",
    "location": "Ikeja, Lagos",
    "latitude": None,
    "longitude": None,
    "capacity": 40,
    "capacity_unit": "people",
}

SLOT = {"date": "2026-10-05", "start_time": "09:00", "end_time": "14:00"}


def make_user(username, email):
    return User.objects.create_user(
        username=username, email=email, password=PASSWORD
    )


def auth_client(user):
    """APIClient carrying a valid JWT access token for `user`."""
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


class ResourceApiTests(APITestCase):
    def setUp(self):
        self.owner = make_user("john", "john@example.com")
        self.other = make_user("sarah", "sarah@example.com")
        self.owner_client = auth_client(self.owner)
        self.other_client = auth_client(self.other)

    def make_resource(self, **overrides):
        data = {**RESOURCE, **overrides}
        res = self.owner_client.post("/api/resources/", data, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        return res.data

    # -- 1. authenticated create ----------------------------------------
    def test_01_authenticated_user_can_create_resource(self):
        data = self.make_resource()
        self.assertEqual(data["owner"], self.owner.id)
        self.assertEqual(data["status"], "active")
        self.assertEqual(data["category"], "space")
        self.assertTrue(Resource.objects.filter(pk=data["id"]).exists())

    # -- 2. unauthenticated create ----------------------------------------
    def test_02_unauthenticated_user_cannot_create_resource(self):
        res = self.client.post("/api/resources/", RESOURCE, format="json")
        self.assertEqual(res.status_code, 401)

    # -- 3. list -----------------------------------------------------------
    def test_03_user_can_list_resources(self):
        created = self.make_resource()
        res = self.owner_client.get("/api/resources/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(any(r["id"] == created["id"] for r in res.data))

    # -- 4. retrieve --------------------------------------------------------
    def test_04_user_can_retrieve_resource(self):
        created = self.make_resource()
        res = self.other_client.get(f"/api/resources/{created['id']}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["name"], RESOURCE["name"])

    # -- 5. owner update ------------------------------------------------------
    def test_05_owner_can_update_resource(self):
        created = self.make_resource()
        res = self.owner_client.patch(
            f"/api/resources/{created['id']}/", {"name": "Renamed Room"}, format="json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["name"], "Renamed Room")

    # -- 6. owner delete --------------------------------------------------------
    def test_06_owner_can_delete_resource(self):
        created = self.make_resource()
        res = self.owner_client.delete(f"/api/resources/{created['id']}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Resource.objects.filter(pk=created["id"]).exists())

    # -- 7. another user cannot update -------------------------------------------
    def test_07_another_user_cannot_update_resource(self):
        created = self.make_resource()
        res = self.other_client.patch(
            f"/api/resources/{created['id']}/", {"name": "Hijacked"}, format="json"
        )
        self.assertEqual(res.status_code, 403)
        self.assertEqual(Resource.objects.get(pk=created["id"]).name, RESOURCE["name"])

    # -- 8. another user cannot delete ----------------------------------------------
    def test_08_another_user_cannot_delete_resource(self):
        created = self.make_resource()
        res = self.other_client.delete(f"/api/resources/{created['id']}/")
        self.assertEqual(res.status_code, 403)
        self.assertTrue(Resource.objects.filter(pk=created["id"]).exists())

    # -- 9. inactive not treated as active ----------------------------------------------
    def test_09_inactive_resource_not_treated_as_active(self):
        created = self.make_resource()
        res = self.owner_client.patch(
            f"/api/resources/{created['id']}/", {"status": "inactive"}, format="json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "inactive")
        active = self.owner_client.get("/api/resources/?status=active")
        self.assertFalse(any(r["id"] == created["id"] for r in active.data))

    # -- 18. category filtering ----------------------------------------------------------
    def test_18_category_filtering_works(self):
        space = self.make_resource(name="Space One")
        self.make_resource(name="Store One", category="storage")
        res = self.owner_client.get("/api/resources/?category=space")
        ids = [r["id"] for r in res.data]
        self.assertIn(space["id"], ids)
        self.assertTrue(all(r["category"] == "space" for r in res.data))

    # -- 19. location filtering ---------------------------------------------------------------
    def test_19_location_filtering_works(self):
        ikeja = self.make_resource(name="Ikeja Room")
        self.make_resource(name="Ota Store", location="Ota, Ogun State")
        res = self.owner_client.get("/api/resources/?location=ikeja")
        ids = [r["id"] for r in res.data]
        self.assertIn(ikeja["id"], ids)
        self.assertTrue(all("ikeja" in r["location"].lower() for r in res.data))

    # -- 20. status filtering ----------------------------------------------------------------------
    def test_20_status_filtering_works(self):
        active = self.make_resource(name="Active Room")
        inactive = self.make_resource(name="Quiet Room")
        self.owner_client.patch(
            f"/api/resources/{inactive['id']}/", {"status": "inactive"}, format="json"
        )
        res = self.owner_client.get("/api/resources/?status=inactive")
        ids = [r["id"] for r in res.data]
        self.assertIn(inactive["id"], ids)
        self.assertNotIn(active["id"], ids)


class AvailabilityApiTests(APITestCase):
    def setUp(self):
        self.owner = make_user("john", "john@example.com")
        self.other = make_user("sarah", "sarah@example.com")
        self.owner_client = auth_client(self.owner)
        self.other_client = auth_client(self.other)
        res = self.owner_client.post("/api/resources/", RESOURCE, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.resource_id = res.data["id"]

    def post_slot(self, client=None, **overrides):
        client = client or self.owner_client
        return client.post(
            f"/api/resources/{self.resource_id}/availability/",
            {**SLOT, **overrides},
            format="json",
        )

    # -- 10. owner can create --------------------------------------------------
    def test_10_owner_can_create_availability(self):
        res = self.post_slot()
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data["status"], "available")
        self.assertTrue(
            Availability.objects.filter(
                resource_id=self.resource_id, date="2026-10-05"
            ).exists()
        )

    # -- 11. another user cannot create ----------------------------------------
    def test_11_another_user_cannot_create_availability(self):
        res = self.post_slot(client=self.other_client)
        self.assertEqual(res.status_code, 403)
        self.assertFalse(Availability.objects.filter(resource_id=self.resource_id).exists())

    # -- 12. start must be before end ------------------------------------------
    def test_12_start_time_must_be_before_end_time(self):
        res = self.post_slot(start_time="20:00", end_time="14:00")
        self.assertEqual(res.status_code, 400)

    # -- 13. overlap rejected (incl. exact duplicate) --------------------------
    def test_13_overlapping_availability_is_rejected(self):
        self.assertEqual(self.post_slot().status_code, 201)
        # Exact duplicate.
        self.assertEqual(self.post_slot().status_code, 400)
        # Partial overlap 12:00-16:00 vs 09:00-14:00.
        res = self.post_slot(start_time="12:00", end_time="16:00")
        self.assertEqual(res.status_code, 400)

    # -- 14. adjacent allowed --------------------------------------------------
    def test_14_adjacent_periods_are_allowed(self):
        self.assertEqual(self.post_slot().status_code, 201)
        res = self.post_slot(start_time="14:00", end_time="18:00")
        self.assertEqual(res.status_code, 201, res.content)

    # -- 15. owner can update --------------------------------------------------
    def test_15_owner_can_update_availability(self):
        slot_id = self.post_slot().data["id"]
        res = self.owner_client.patch(
            f"/api/availability/{slot_id}/", {"end_time": "15:00"}, format="json"
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["end_time"], "15:00:00")

    # -- 16. owner can delete --------------------------------------------------
    def test_16_owner_can_delete_availability(self):
        slot_id = self.post_slot().data["id"]
        res = self.owner_client.delete(f"/api/availability/{slot_id}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Availability.objects.filter(pk=slot_id).exists())

    # -- 17. inactive resources take no new availability -----------------------
    def test_17_inactive_resource_cannot_receive_new_availability(self):
        self.owner_client.patch(
            f"/api/resources/{self.resource_id}/",
            {"status": "inactive"},
            format="json",
        )
        res = self.post_slot()
        self.assertEqual(res.status_code, 400)
