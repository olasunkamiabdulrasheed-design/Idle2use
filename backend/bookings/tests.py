"""Stage 7-10 tests: notifications, messaging, bookings, reviews."""

from datetime import date, time, timedelta

from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from bookings.models import Booking, Review
from capacity_requests.models import CapacityRequest
from messaging.models import Conversation, Message
from notifications.models import Notification, notify
from resources.models import Resource

PASSWORD = "StrongPassword123!"
WHEN = date.today() + timedelta(days=5)


def auth_client(user):
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}")
    return client


class NotificationTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="notif", email="n@x.com", password=PASSWORD)
        cls.other = User.objects.create_user(
            username="notif2", email="n2@x.com", password=PASSWORD)

    def test_notify_and_list_only_own(self):
        notify(self.user, "Hello", "body", "/link")
        notify(self.other, "Secret", "x", "")
        res = auth_client(self.user).get("/api/notifications/")
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["title"], "Hello")

    def test_mark_read(self):
        n = notify(self.user, "Read me")
        c = auth_client(self.user)
        res = c.post(f"/api/notifications/{n.pk}/read/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["is_read"])
        notify(self.user, "Second")
        res2 = c.post("/api/notifications/read-all/")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(Notification.objects.filter(
            recipient=self.user, is_read=False).count(), 0)

    def test_cannot_read_others_notifications(self):
        n = notify(self.other, "Private")
        res = auth_client(self.user).post(f"/api/notifications/{n.pk}/read/")
        self.assertEqual(res.status_code, 404)


class MessagingTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.alice = User.objects.create_user(
            username="alice", email="a@x.com", password=PASSWORD)
        cls.bob = User.objects.create_user(
            username="bob", email="b@x.com", password=PASSWORD)
        cls.eve = User.objects.create_user(
            username="eve", email="e@x.com", password=PASSWORD)

    def make_conversation(self, client, other):
        res = client.post("/api/conversations/",
                          {"participants": [other.pk]}, format="json")
        self.assertIn(res.status_code, (200, 201), res.content)
        return res

    def test_create_and_message_flow(self):
        c = auth_client(self.alice)
        conv = self.make_conversation(c, self.bob).data["id"]
        res = c.post(f"/api/conversations/{conv}/messages/",
                     {"body": "Hello Bob"}, format="json")
        self.assertEqual(res.status_code, 201)
        # Bob sees it and it is marked read on fetch.
        b = auth_client(self.bob)
        msgs = b.get(f"/api/conversations/{conv}/messages/")
        self.assertEqual(len(msgs.data), 1)
        self.assertTrue(msgs.data[0]["is_read"])
        # Notification created for the recipient.
        self.assertTrue(Notification.objects.filter(
            recipient=self.bob, title__contains="alice").exists())

    def test_non_participant_blocked(self):
        c = auth_client(self.alice)
        conv = self.make_conversation(c, self.bob).data["id"]
        eve = auth_client(self.eve)
        self.assertEqual(eve.get(f"/api/conversations/{conv}/messages/"
                                 ).status_code, 403)
        self.assertEqual(
            eve.post(f"/api/conversations/{conv}/messages/",
                     {"body": "intrude"}, format="json").status_code, 403)

    def test_duplicate_conversation_reused(self):
        c = auth_client(self.alice)
        first = self.make_conversation(c, self.bob).data["id"]
        second = self.make_conversation(c, self.bob).data["id"]
        self.assertEqual(first, second)


class BookingReviewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = User.objects.create_user(
            username="host", email="h@x.com", password=PASSWORD)
        cls.guest = User.objects.create_user(
            username="guest", email="g@x.com", password=PASSWORD)
        cls.stranger = User.objects.create_user(
            username="stranger", email="s@x.com", password=PASSWORD)
        cls.request = CapacityRequest.objects.create(
            requester=cls.guest, category="space", location="Ikeja",
            capacity_required=10, date=WHEN,
            start_time=time(10, 0), end_time=time(16, 0),
            original_text="need space")
        cls.resource = Resource.objects.create(
            owner=cls.owner, category="space", name="Hall", location="Ikeja",
            capacity=40, capacity_unit="people")

    def make_booking(self, client=None, **overrides):
        client = client or auth_client(self.guest)
        data = {"request": self.request.pk, "resource": self.resource.pk}
        data.update(overrides)
        return client.post("/api/bookings/", data, format="json")

    def test_create_booking_notifies_provider(self):
        res = self.make_booking()
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data["provider"], self.owner.pk)
        self.assertEqual(res.data["status"], "pending")
        self.assertTrue(Notification.objects.filter(
            recipient=self.owner, title="New booking request").exists())

    def test_double_booking_rejected(self):
        self.assertEqual(self.make_booking().status_code, 201)
        res2 = self.make_booking()
        self.assertEqual(res2.status_code, 400)

    def test_stranger_cannot_see_or_update_booking(self):
        bid = self.make_booking().data["id"]
        s = auth_client(self.stranger)
        self.assertEqual(s.get("/api/bookings/").data, [])
        # Scoped queryset → 404 (existence hidden) for non-participants.
        self.assertEqual(
            s.patch(f"/api/bookings/{bid}/", {"status": "confirmed"},
                    format="json").status_code, 404)

    def test_lifecycle_and_invalid_transition(self):
        bid = self.make_booking().data["id"]
        p = auth_client(self.owner)
        self.assertEqual(
            p.patch(f"/api/bookings/{bid}/", {"status": "confirmed"},
                    format="json").status_code, 200)
        self.assertEqual(
            p.patch(f"/api/bookings/{bid}/", {"status": "pending"},
                    format="json").status_code, 400)
        self.assertEqual(
            p.patch(f"/api/bookings/{bid}/", {"status": "completed"},
                    format="json").status_code, 200)

    def test_review_only_after_completion_and_once(self):
        bid = self.make_booking().data["id"]
        early = auth_client(self.guest).post(
            "/api/reviews/", {"booking": bid, "rating": 5}, format="json")
        self.assertEqual(early.status_code, 400)
        auth_client(self.owner).patch(
            f"/api/bookings/{bid}/", {"status": "confirmed"}, format="json")
        auth_client(self.owner).patch(
            f"/api/bookings/{bid}/", {"status": "completed"}, format="json")
        g = auth_client(self.guest)
        ok = g.post("/api/reviews/",
                    {"booking": bid, "rating": 5, "comment": "Great"},
                    format="json")
        self.assertEqual(ok.status_code, 201, ok.content)
        dup = g.post("/api/reviews/", {"booking": bid, "rating": 4},
                     format="json")
        self.assertEqual(dup.status_code, 400)
        # Only participants may review (403).
        st = auth_client(self.stranger).post(
            "/api/reviews/", {"booking": bid, "rating": 5}, format="json")
        self.assertEqual(st.status_code, 403)
        self.assertEqual(Review.objects.count(), 1)


class DashboardTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="dash", email="d@x.com", password=PASSWORD)

    def test_dashboard_requires_auth_and_returns_counters(self):
        self.assertEqual(self.client.get("/api/dashboard/").status_code, 401)
        res = auth_client(self.user).get("/api/dashboard/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["active_requests"], 0)
        self.assertEqual(res.data["my_resources"], 0)
        self.assertIn("unread_notifications", res.data)
