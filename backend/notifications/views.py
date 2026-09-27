"""Stage 7 views: my notifications, mark read."""

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class MarkAllReadView(APIView):
    """POST /api/notifications/read-all/"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({"updated": updated})


class MarkReadView(APIView):
    """POST /api/notifications/<id>/read/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        obj = Notification.objects.filter(pk=pk, recipient=request.user).first()
        if obj is None:
            return Response({"detail": "Not found."}, status=404)
        obj.is_read = True
        obj.save(update_fields=["is_read"])
        return Response(NotificationSerializer(obj).data)
