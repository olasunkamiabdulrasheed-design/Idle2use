"""Stage 5 model: Match — a scored link between a request and a resource.

    CapacityRequest 1 ──< Match >── 1 Resource

Unique per (request, resource) so re-running matching never duplicates.
"""

from django.db import models

from capacity_requests.models import CapacityRequest
from resources.models import Resource


class MatchStatus(models.TextChoices):
    NEW = "new", "New"
    VIEWED = "viewed", "Viewed"
    DISMISSED = "dismissed", "Dismissed"


class Match(models.Model):
    request = models.ForeignKey(
        CapacityRequest, on_delete=models.CASCADE, related_name="matches"
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="matches"
    )
    score = models.PositiveIntegerField(
        help_text="Application matching score 0-100, not scientific certainty."
    )
    reasons = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=10, choices=MatchStatus.choices, default=MatchStatus.NEW
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-score", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["request", "resource"], name="unique_request_resource_match"
            ),
        ]

    def __str__(self):
        return f"{self.score}% {self.request_id}->{self.resource_id}"
