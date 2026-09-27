"""Stage 8 serializers: conversation + messages (participant-safe)."""

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username",
                                            read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "sender_username", "body",
                  "is_read", "created_at")
        read_only_fields = ("id", "conversation", "sender", "sender_username",
                            "is_read", "created_at")


class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all()
    )
    participant_names = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "participants", "participant_names", "title",
                  "last_message", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def get_participant_names(self, obj):
        return [u.username for u in obj.participants.all()]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if not msg:
            return None
        return {"body": msg.body[:120], "sender": msg.sender.username,
                "created_at": msg.created_at.isoformat()}
