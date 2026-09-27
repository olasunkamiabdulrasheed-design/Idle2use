from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ConversationMessagesView, ConversationViewSet

router = DefaultRouter()
router.register("conversations", ConversationViewSet, basename="conversation")

urlpatterns = [
    path("conversations/<int:pk>/messages/", ConversationMessagesView.as_view(),
         name="conversation-messages"),
    *router.urls,
]
