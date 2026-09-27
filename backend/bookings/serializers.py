"""Stage 9/10 serializers: booking + review with server-side checks."""

from rest_framework import serializers

from .models import Booking, Review
from .services import find_conflict, validate_transition


class BookingSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(
        source="requester.username", read_only=True)
    provider_username = serializers.CharField(
        source="provider.username", read_only=True)
    resource_name = serializers.CharField(
        source="resource.name", read_only=True)

    class Meta:
        model = Booking
        fields = ("id", "request", "resource", "resource_name", "requester",
                  "requester_username", "provider", "provider_username",
                  "date", "start_time", "end_time", "agreed_price", "status",
                  "created_at", "updated_at")
        read_only_fields = ("id", "request", "resource", "requester",
                            "provider", "created_at", "updated_at")

    def validate(self, attrs):
        instance = self.instance
        start = attrs.get("start_time", getattr(instance, "start_time", None))
        end = attrs.get("end_time", getattr(instance, "end_time", None))
        day = attrs.get("date", getattr(instance, "date", None))
        resource = getattr(instance, "resource", None)
        if instance and "status" in attrs:
            try:
                validate_transition(instance, attrs["status"])
            except ValueError as exc:
                raise serializers.ValidationError({"status": str(exc)})
        if instance and resource and day and start and end:
            conflict = find_conflict(resource, day, start, end,
                                     exclude_pk=instance.pk)
            if conflict:
                raise serializers.ValidationError(
                    {"date": "The resource is already booked for this period."}
                )
        return attrs


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(
        source="reviewer.username", read_only=True)
    reviewee_username = serializers.CharField(
        source="reviewee.username", read_only=True)

    class Meta:
        model = Review
        fields = ("id", "booking", "reviewer", "reviewer_username", "reviewee",
                  "reviewee_username", "rating", "comment", "created_at")
        read_only_fields = ("id", "reviewer", "reviewee", "created_at")

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
