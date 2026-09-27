"""Stage 8 views: conversations + messages. Participant-only access."""

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import notify

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


def _is_participant(conversation, user):
    return conversation.participants.filter(pk=user.pk).exists()


class ConversationViewSet(viewsets.ModelViewSet):
    """GET/POST /api/conversations/, GET/PATCH/DELETE /api/conversations/<id>/.

    Creating: pass `participants` including at least one other user; the
    server always adds request.user. Duplicate 1:1 conversations are reused.
    """

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related("participants")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        other_ids = [
            getattr(u, "pk", None) or int(u)
            for u in serializer.validated_data.get("participants", [])
        ]
        other_ids = [pk for pk in other_ids if pk != request.user.pk]
        others = User.objects.filter(pk__in=other_ids)
        if not others.exists():
            return Response(
                {"detail": "Add at least one other participant."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Reuse an existing conversation for this exact participant set.
        wanted = set(other_ids) | {request.user.pk}
        for existing in Conversation.objects.filter(
            participants=request.user
        ).prefetch_related("participants"):
            if set(existing.participants.values_list("pk", flat=True)) == wanted:
                return Response(
                    ConversationSerializer(existing).data,
                    status=status.HTTP_200_OK,
                )
        conversation = serializer.save()
        conversation.participants.add(request.user, *others)
        return Response(
            ConversationSerializer(conversation).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_destroy(self, instance):
        if not _is_participant(instance, self.request.user):
            raise PermissionDenied("Not your conversation.")
        instance.delete()


class ConversationMessagesView(APIView):
    """GET (marks received as read) / POST /api/conversations/<id>/messages/."""

    permission_classes = [IsAuthenticated]

    def _conversation(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if not _is_participant(conv, request.user):
            raise PermissionDenied("You are not part of this conversation.")
        return conv

    def get(self, request, pk):
        conv = self._conversation(request, pk)
        Message.objects.filter(
            conversation=conv, is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        messages = conv.messages.select_related("sender")
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, pk):
        conv = self._conversation(request, pk)
        body = str(request.data.get("body", "")).strip()
        if not body:
            return Response({"detail": "Message cannot be empty."}, status=400)
        msg = Message.objects.create(
            conversation=conv, sender=request.user, body=body[:4000]
        )
        others = conv.participants.exclude(pk=request.user.pk)
        for user in others:
            notify(
                user,
                f"New message from {request.user.username}",
                body[:100],
                f"/messages/{conv.pk}",
            )
        conv.save()  # bump updated_at for ordering
        return Response(MessageSerializer(msg).data, status=201)
