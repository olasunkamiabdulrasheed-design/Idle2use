"""Stage 5 routes, mounted at /api/ by config.urls."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DashboardView, MatchViewSet, RequestMatchesView

router = DefaultRouter()
router.register("matches", MatchViewSet, basename="match")

urlpatterns = [
    path("requests/<int:pk>/matches/", RequestMatchesView.as_view(),
         name="request-matches"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    *router.urls,
]
