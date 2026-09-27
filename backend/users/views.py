"""Stage 2 API views: registration + JWT login/me/logout + protected test.

Views handle HTTP/API behavior only (permissions, status codes, tokens).
Input validation and user creation live in serializers.py.
Password verification lives in Django's auth system / Simple JWT.
"""

from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a user, return safe user info."""

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class LoginView(APIView):
    """POST /api/auth/login/ — verify credentials, return JWT pair + user."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """GET /api/auth/me/ — return the authenticated user (JWT required)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """POST /api/auth/logout/ — blacklist the refresh token.

    JWT access tokens are stateless: blacklisting the refresh token stops
    future refreshes, but already-issued access tokens remain valid until
    their (short, 15-minute) expiry. The frontend must also discard tokens.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh", "")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ProtectedTestView(APIView):
    """GET /api/auth/protected-test/ — DEV/TEST ONLY, remove later.

    Proves JWT Bearer authentication works end to end.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {"message": "Authentication successful", "user": request.user.username}
        )


class UserListView(APIView):
    """GET /api/users/ � safe directory (id + username) for starting chats."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(pk=request.user.pk).order_by("username")
        return Response([{"id": u.pk, "username": u.username} for u in users])
