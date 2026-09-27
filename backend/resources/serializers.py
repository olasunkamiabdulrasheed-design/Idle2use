"""Stage 3 serializers: validate input + serialize DB objects.

Complex overlap/business rules live in services.py; serializers translate
service exceptions into DRF 400 responses. Views inject the Resource via
serializer context (never trust a client-supplied resource id).
"""

from rest_framework import serializers

from .models import Availability, Resource
from .services import AvailabilityConflict, validate_availability_slot


class ResourceSerializer(serializers.ModelSerializer):
    """Safe Resource shape. Owner is server-assigned, never client input."""

    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Resource
        fields = (
            "id",
            "owner",
            "owner_username",
            "category",
            "name",
            "description",
            "location",
            "latitude",
            "longitude",
            "capacity",
            "capacity_unit",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "owner_username", "created_at", "updated_at")


class AvailabilitySerializer(serializers.ModelSerializer):
    """Availability shape. Resource comes from the URL, not the payload."""

    resource = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Availability
        fields = (
            "id",
            "resource",
            "date",
            "start_time",
            "end_time",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "resource", "created_at", "updated_at")

    def validate(self, attrs):
        resource = self.context.get("resource")
        if resource is None and self.instance is not None:
            resource = self.instance.resource
        if resource is None:
            raise serializers.ValidationError("Resource context is required.")
        # Merge with existing values so PATCH (partial) validates fully.
        slot_date = attrs.get("date", getattr(self.instance, "date", None))
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if slot_date is None or start is None or end is None:
            raise serializers.ValidationError(
                "date, start_time and end_time are required."
            )
        exclude_id = self.instance.pk if self.instance else None
        try:
            validate_availability_slot(resource, slot_date, start, end, exclude_id)
        except AvailabilityConflict as exc:
            raise serializers.ValidationError({"non_field_errors": [str(exc)]})
        except ValueError as exc:
            raise serializers.ValidationError({"non_field_errors": [str(exc)]})
        return attrs
