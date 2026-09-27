"""Stage 4 routes, mounted at /api/requests/ by config.urls."""

from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import CapacityRequestViewSet, ParseRequestView

router = DefaultRouter()
router.register("requests", CapacityRequestViewSet, basename="capacity-request")

# Explicit paths must precede the router so "parse" is never treated as a pk.
urlpatterns = [
    path("requests/parse/", ParseRequestView.as_view(), name="request-parse"),
    *router.urls,
]
