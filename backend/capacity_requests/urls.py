"""Stage 4 routes, mounted at /api/requests/ by config.urls."""

from rest_framework.routers import DefaultRouter

from .views import CapacityRequestViewSet

router = DefaultRouter()
router.register("requests", CapacityRequestViewSet, basename="capacity-request")

urlpatterns = router.urls
