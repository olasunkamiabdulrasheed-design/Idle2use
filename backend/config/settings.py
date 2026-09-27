"""
Django settings for the Idle2Use project (Stage 1: Project Foundation,
Stage 2: User registration + JWT authentication,
Stage 3: Resource + Availability,
Stage 4: Capacity Requests,
Stage 5: Matching Engine,
Stages 7-10: Notifications, Messaging, Bookings, Reviews).

Configuration is read from environment variables (see backend/.env.example).
If PostgreSQL variables are not set, the project falls back to a local
SQLite database so it can run without a database server.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load backend/.env for local development. Real secrets must never be
# committed; see backend/.env.example for the documented variables.
load_dotenv(BASE_DIR / ".env")


def _env(name, default=""):
    """Read env var; accepts both the legacy DJANGO_* names and the plain
    production names (SECRET_KEY, DEBUG, ...) used by render.yaml."""
    plain = name.removeprefix("DJANGO_")
    return os.environ.get(name) or os.environ.get(plain) or default


def _env_list(name, default=""):
    values = _env(name, "")
    if not values:
        values = default
    return [item.strip() for item in values.split(",") if item.strip()]


# SECURITY WARNING: keep the secret key used in production secret!
# Production (Render) MUST set SECRET_KEY / DJANGO_SECRET_KEY; the dev
# default below is only acceptable when DEBUG=True.
SECRET_KEY = _env("DJANGO_SECRET_KEY", "django-insecure-stage1-dev-only")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = _env("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = _env_list(
    "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1"
)

# Render injects the public hostname; accept it automatically so the
# service works even if ALLOWED_HOSTS is not updated by hand.
if os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])

if not DEBUG and SECRET_KEY.startswith("django-insecure-"):
    raise ImproperlyConfigured(
        "SECRET_KEY must be set to a real value when DEBUG=False."
    )

# HTTPS origins allowed to POST during Django admin / browser forms.
CSRF_TRUSTED_ORIGINS = _env_list("CSRF_TRUSTED_ORIGINS")


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "users",
    "resources",
    "capacity_requests",
    "matches",
    "notifications",
    "messaging",
    "bookings",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# Priority: DATABASE_URL (Render PostgreSQL) → POSTGRES_* variables →
# local SQLite for development. Nothing is hardcoded.
if os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.config(
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
elif os.environ.get("POSTGRES_DB"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("POSTGRES_DB"),
            "USER": os.environ.get("POSTGRES_USER", ""),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
            "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Django REST Framework (Stage 1: JSON only; Stage 2: JWT auth added)

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}


# Simple JWT (Stage 2). Access tokens are short-lived; refresh tokens are
# long-lived and can be blacklisted on logout. Already-issued access tokens
# remain valid until expiry (stateless JWT tradeoff).
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# CORS: allow the Vite dev server to call the API from the browser.

CORS_ALLOWED_ORIGINS = _env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5174")


# Internationalization

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images) — served by WhiteNoise in
# production (collectstatic runs during the Render build).

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"
    },
}


# Production security posture (applied automatically when DEBUG=False).
# Render terminates TLS at the proxy, so HTTPS signals are forwarded.

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    USE_X_FORWARDED_HOST = True
    SECURE_SSL_REDIRECT = _env("DJANGO_SECURE_SSL_REDIRECT", "True") == "True"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # 1 hour by default: short enough to avoid a permanent lockout if the
    # domain is ever moved off HTTPS, long enough to silence the HSTS check.
    SECURE_HSTS_SECONDS = int(_env("DJANGO_SECURE_HSTS_SECONDS", "3600"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0
    SECURE_HSTS_PRELOAD = SECURE_HSTS_SECONDS > 0
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    X_FRAME_OPTIONS = "DENY"


# Email
# Development: print emails to the console. Production: leave MAILERS
# undefined so Django falls back to its SMTP default, configured through
# EMAIL_* environment variables (see .env.example). The app currently has
# no outbound-email flows, so no SMTP credentials are required to deploy.

if DEBUG:
    MAILERS = {
        "default": {
            "BACKEND": "django.core.mail.backends.console.EmailBackend",
        },
    }
else:
    EMAIL_HOST = _env("EMAIL_HOST", "localhost")
    EMAIL_PORT = int(_env("EMAIL_PORT", "25"))
    EMAIL_HOST_USER = _env("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = _env("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = _env("EMAIL_USE_TLS", "False") == "True"
