"""Stage 3 routes, mounted at /api/ by config.urls."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AvailabilityDetailView, ResourceAvailabilityView, ResourceViewSet

router = DefaultRouter()
router.register("resources", ResourceViewSet, basename="resource")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "resources/<int:resource_id>/availability/",
        ResourceAvailabilityView.as_view(),
        name="resource-availability",
    ),
    path(
        "availability/<int:pk>/",
        AvailabilityDetailView.as_view(),
        name="availability-detail",
    ),
]
