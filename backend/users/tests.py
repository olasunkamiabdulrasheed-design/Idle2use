"""Stage 2 authentication API tests.

Covers: registration, login, JWT refresh, /me, logout (blacklist),
protected-test, UserProfile auto-creation, and admin access.
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import Client, TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from users.models import UserProfile

VALID_USER = {
    "username": "john",
    "email": "john@example.com",
    "password": "StrongPassword123!",
    "password_confirm": "StrongPassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "08012345678",
}


def register(client, **overrides):
    data = {**VALID_USER, **overrides}
    return client.post("/api/auth/register/", data, format="json")


def login(client, username="john", password="StrongPassword123!"):
    return client.post(
        "/api/auth/login/",
        {"username": username, "password": password},
        format="json",
    )


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    # -- 1. successful registration -------------------------------------
    def test_1_successful_registration(self):
        res = register(self.client)
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(res.data["username"], "john")
        self.assertEqual(res.data["email"], "john@example.com")
        self.assertEqual(res.data["profile"]["phone"], "08012345678")
        # Never expose password material.
        self.assertNotIn("password", res.data)
        self.assertNotIn("password_confirm", res.data)
        user = User.objects.get(username="john")
        # Password must be hashed, never plaintext.
        self.assertNotEqual(user.password, "StrongPassword123!")
        self.assertTrue(user.check_password("StrongPassword123!"))

    # -- 2. duplicate username rejected ----------------------------------
    def test_2_duplicate_username_rejected(self):
        self.assertEqual(register(self.client).status_code, 201)
        res = register(self.client, email="other@example.com")
        self.assertEqual(res.status_code, 400)
        self.assertIn("username", res.data)

    # -- 3. duplicate email rejected (API-level unique, documented) ------
    def test_3_duplicate_email_rejected(self):
        self.assertEqual(register(self.client).status_code, 201)
        res = register(self.client, username="john2")
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.data)

    # -- 4. password mismatch rejected -----------------------------------
    def test_4_password_mismatch_rejected(self):
        res = register(self.client, password_confirm="Different123!")
        self.assertEqual(res.status_code, 400)

    # -- 5. weak password rejected ---------------------------------------
    def test_5_weak_password_rejected(self):
        res = register(self.client, password="123", password_confirm="123")
        self.assertEqual(res.status_code, 400)
        self.assertIn("password", res.data)

    # -- 6. successful login ---------------------------------------------
    def test_6_successful_login(self):
        register(self.client)
        res = login(self.client)
        self.assertEqual(res.status_code, 200, res.content)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["username"], "john")
        self.assertNotIn("password", res.data["user"])

    # -- 7. invalid password rejected ------------------------------------
    def test_7_invalid_password_rejected(self):
        register(self.client)
        res = login(self.client, password="WrongPassword123!")
        self.assertEqual(res.status_code, 400)

    # -- 8. authenticated /me works --------------------------------------
    def test_8_authenticated_me_works(self):
        register(self.client)
        tokens = login(self.client).data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.get("/api/auth/me/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "john")
        self.assertEqual(res.data["profile"]["phone"], "08012345678")
        self.assertFalse(res.data["profile"]["is_phone_verified"])
        self.assertNotIn("password", res.data)

    # -- 9. unauthenticated /me rejected ---------------------------------
    def test_9_unauthenticated_me_rejected(self):
        res = self.client.get("/api/auth/me/")
        self.assertEqual(res.status_code, 401)

    # -- 10. valid access token works on protected-test ------------------
    def test_10_protected_test_with_valid_token(self):
        register(self.client)
        tokens = login(self.client).data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.get("/api/auth/protected-test/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["message"], "Authentication successful")
        self.assertEqual(res.data["user"], "john")

    # -- 11. invalid/expired token rejected ------------------------------
    def test_11_invalid_and_expired_token_rejected(self):
        # Invalid token.
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid.token.here")
        self.assertEqual(self.client.get("/api/auth/protected-test/").status_code, 401)
        # Expired token (exp forced into the past).
        user = User.objects.create_user(username="exp", password="StrongPassword123!")
        token = AccessToken.for_user(user)
        token.set_exp(lifetime=timedelta(seconds=-1))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(self.client.get("/api/auth/protected-test/").status_code, 401)

    # -- 12. token refresh works -----------------------------------------
    def test_12_token_refresh_works(self):
        register(self.client)
        refresh = login(self.client).data["refresh"]
        res = self.client.post(
            "/api/auth/token/refresh/", {"refresh": refresh}, format="json"
        )
        self.assertEqual(res.status_code, 200, res.content)
        self.assertIn("access", res.data)

    # -- 13. logout blacklists refresh token -----------------------------
    def test_13_logout_blacklists_refresh_token(self):
        register(self.client)
        tokens = login(self.client).data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.post(
            "/api/auth/logout/", {"refresh": tokens["refresh"]}, format="json"
        )
        self.assertEqual(res.status_code, 205)
        # Same refresh token can no longer be used (blacklisted).
        res2 = self.client.post(
            "/api/auth/token/refresh/", {"refresh": tokens["refresh"]}, format="json"
        )
        self.assertIn(res2.status_code, (400, 401))

    # -- 14. UserProfile auto-created -------------------------------------
    def test_14_profile_created_for_new_user(self):
        register(self.client)
        user = User.objects.get(username="john")
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.phone, "08012345678")
        self.assertFalse(profile.is_phone_verified)
        self.assertFalse(profile.is_identity_verified)


class AdminAccessTests(TestCase):
    """Existing superuser 'idle2' must still reach Django admin."""

    def test_superuser_admin_access(self):
        if not User.objects.filter(username="idle2").exists():
            User.objects.create_superuser(
                username="idle2", email="idle2@example.com", password="TempPass123!"
            )
        client = Client()
        client.force_login(User.objects.get(username="idle2"))
        self.assertEqual(client.get("/admin/").status_code, 200)
        self.assertEqual(client.get("/admin/users/userprofile/").status_code, 200)
