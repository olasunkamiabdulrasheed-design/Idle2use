"""Stage 4 model: CapacityRequest — the "I NEED CAPACITY" side.

One row = one person's persistent need. Structured fields drive the
matching engine (Stage 5); `original_text` preserves what the user
actually said so NL parsing (Stage 4B) has an auditable source.

    User 1 ─── * CapacityRequest
"""

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db import models

from resources.models import ResourceCategory


class RequestStatus(models.TextChoices):
    """Lifecycle of a request.

    active    → being searched (default; stays searchable indefinitely)
    matched   → at least one match was produced
    fulfilled → the need was met (terminal)
    cancelled → requester withdrew it (terminal)
    expired   → time-based expiry, set later by a cleanup job (terminal)
    """

    ACTIVE = "active", "Active"
    MATCHED = "matched", "Matched"
    FULFILLED = "fulfilled", "Fulfilled"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"


class CapacityRequest(models.Model):
    requester = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="capacity_requests"
    )
    category = models.CharField(max_length=20, choices=ResourceCategory.choices)
    resource_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="Specific kind of resource, e.g. 'hall', 'classroom'.",
    )
    location = models.CharField(max_length=255)
    capacity_required = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="How much capacity is needed (people, boxes, items...).",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    purpose = models.CharField(max_length=255, blank=True)
    requirements = models.TextField(
        blank=True, help_text="Extra constraints, e.g. 'must have projector'."
    )
    status = models.CharField(
        max_length=12, choices=RequestStatus.choices, default=RequestStatus.ACTIVE
    )
    original_text = models.TextField(
        blank=True, help_text="The natural-language request as the user said it."
    )
    structured_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Validated parser output (Stage 4B); never trusted blindly.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(start_time__lt=models.F("end_time")),
                name="request_start_before_end",
            ),
        ]

    def __str__(self):
        return f"[{self.status}] {self.category} · {self.location} · {self.date}"

    @property
    def is_searchable(self):
        """True while the request should participate in matching."""
        return self.status == RequestStatus.ACTIVE
