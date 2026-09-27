"""Stage 2 serializers: input validation + user creation + safe output.

Design decisions (documented for the educational requirement):
- first_name / last_name are OPTIONAL (required=False, allow_blank=True).
  Rationale: lower registration friction for the hackathon MVP; they are
  still accepted, stored on User, and returned in responses.
- email is REQUIRED and treated as UNIQUE at the API level, even though
  Django's default User.email column is not unique in the DB. Rationale:
  prevents two accounts sharing one email (login confusion, password-reset
  ambiguity later). Normalized with BaseUserManager.normalize_email.
- phone is OPTIONAL and lives on UserProfile (not User).
- Passwords are never stored manually: creation goes through
  User.objects.create_user() which hashes with Django's hasher.
- Passwords / hashes are never serialized back.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import BaseUserManager, User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Safe, read-only view of the profile flags + phone."""

    class Meta:
        model = UserProfile
        fields = ("phone", "is_phone_verified", "is_identity_verified")
        read_only_fields = ("is_phone_verified", "is_identity_verified")


class UserSerializer(serializers.ModelSerializer):
    """Safe public representation of an authenticated user."""

    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "profile")
        read_only_fields = ("id", "username", "email", "first_name", "last_name", "profile")


class RegisterSerializer(serializers.Serializer):
    """Validate registration input and create User (+ update UserProfile)."""

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        # Normalize: lowercases the domain part (standard Django behavior).
        normalized = BaseUserManager.normalize_email(value.strip())
        if not normalized:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return normalized

    def validate(self, attrs):
        password = attrs.get("password", "")
        password_confirm = attrs.get("password_confirm", "")
        if not password or not password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": "Both password and password_confirm are required."}
            )
        if password != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        # Run Django's password validators (length, common, numeric, similarity).
        # Pass a temp user so UserAttributeSimilarityValidator can inspect it.
        temp_user = User(
            username=attrs.get("username", ""),
            email=attrs.get("email", ""),
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        try:
            validate_password(password, user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    def create(self, validated_data):
        phone = validated_data.pop("phone", "").strip()
        validated_data.pop("password_confirm", None)
        password = validated_data.pop("password")
        # create_user() hashes the password with Django's hasher. Never store raw.
        user = User.objects.create_user(password=password, **validated_data)
        # post_save signal creates the profile; be defensive in case it is missing.
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if phone:
            profile.phone = phone
            profile.save(update_fields=["phone", "updated_at"])
        # Re-fetch so the returned representation sees the fresh profile
        # (the post_save signal caches an empty profile on the instance).
        return User.objects.select_related("profile").get(pk=user.pk)

    def to_representation(self, instance):
        # Always return the safe UserSerializer shape, never passwords.
        return UserSerializer(instance, context=self.context).data


class LoginSerializer(serializers.Serializer):
    """Validate login credentials using Django's auth system."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        username = attrs.get("username", "").strip()
        password = attrs.get("password", "")
        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")
        # Django handles hashing comparison; we never check passwords manually.
        user = authenticate(
            request=self.context.get("request"), username=username, password=password
        )
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        attrs["user"] = user
        return attrs
