"""Stage 5 serializers: safe Match output with nested summaries."""

from rest_framework import serializers

from capacity_requests.serializers import CapacityRequestSerializer
from resources.serializers import ResourceSerializer

from .models import Match


class MatchSerializer(serializers.ModelSerializer):
    """Full match record with nested request + resource for results UI."""

    request_detail = CapacityRequestSerializer(source="request", read_only=True)
    resource_detail = ResourceSerializer(source="resource", read_only=True)

    class Meta:
        model = Match
        fields = (
            "id",
            "request",
            "request_detail",
            "resource",
            "resource_detail",
            "score",
            "reasons",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = [f for f in fields if f != "status"]
