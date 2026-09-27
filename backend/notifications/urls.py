from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MarkAllReadView, MarkReadView, NotificationViewSet

router = DefaultRouter()
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("notifications/read-all/", MarkAllReadView.as_view(),
         name="notifications-read-all"),
    path("notifications/<int:pk>/read/", MarkReadView.as_view(),
         name="notification-read"),
    *router.urls,
]
