"""Stage 4 serializers: validate input, serialize safe output.

Requester is server-assigned (never client input). Status changes are
checked against services.validate_transition so lifecycle rules live in
one place. The DB CheckConstraint (start < end) backs this up.
"""

from rest_framework import serializers

from .models import CapacityRequest
from .services import validate_transition


class CapacityRequestSerializer(serializers.ModelSerializer):
    """Safe CapacityRequest shape for API consumers."""

    requester = serializers.PrimaryKeyRelatedField(read_only=True)
    requester_username = serializers.CharField(
        source="requester.username", read_only=True
    )

    class Meta:
        model = CapacityRequest
        fields = (
            "id",
            "requester",
            "requester_username",
            "category",
            "resource_type",
            "location",
            "capacity_required",
            "date",
            "start_time",
            "end_time",
            "purpose",
            "requirements",
            "status",
            "original_text",
            "structured_data",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "requester",
            "requester_username",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        # Merge with existing values so PATCH validates the full record.
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start is not None and end is not None and start >= end:
            raise serializers.ValidationError(
                {"end_time": "end_time must be after start_time."}
            )
        if self.instance and "status" in attrs:
            try:
                validate_transition(self.instance, attrs["status"])
            except ValueError as exc:
                raise serializers.ValidationError({"status": str(exc)})
        return attrs
