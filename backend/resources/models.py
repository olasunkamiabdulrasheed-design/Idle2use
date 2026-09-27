"""Stage 3 models: Resource ("I HAVE CAPACITY") + Availability.

Relationships:
    User 1 ─── * Resource 1 ─── * Availability
"""

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db import models


class ResourceCategory(models.TextChoices):
    TRANSPORTATION = "transportation", "Transportation"
    STORAGE = "storage", "Storage"
    SPACE = "space", "Spaces & Venues"
    EQUIPMENT = "equipment", "Equipment"


class ResourceStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"


class AvailabilityStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    UNAVAILABLE = "unavailable", "Unavailable"


class Resource(models.Model):
    """A unit of capacity owned by a user (vehicle, room, space, equipment...).

    One generic model (not per-category tables) so the future matching
    engine can search across all categories uniformly.
    """

    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="resources"
    )
    category = models.CharField(max_length=20, choices=ResourceCategory.choices)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(
        max_length=255,
        help_text="Human-readable location, e.g. 'Ikeja, Lagos'. No maps yet.",
    )
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    # MVP: whole units only (40 people, 5 tons). Fractional capacity deferred.
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    capacity_unit = models.CharField(max_length=50, help_text="e.g. people, boxes, tons")
    status = models.CharField(
        max_length=10, choices=ResourceStatus.choices, default=ResourceStatus.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.category})"

    @property
    def is_active(self):
        return self.status == ResourceStatus.ACTIVE


class Availability(models.Model):
    """One bookable time window on a specific date for a Resource.

    Touching periods (09:00-14:00 + 14:00-18:00) are allowed; overlapping
    ones are rejected in services.py (backend business logic).
    """

    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="availabilities"
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=12,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        constraints = [
            # Defense in depth: serializer/services validate first with
            # friendly errors; the DB guarantees it even if code paths change.
            models.UniqueConstraint(
                fields=["resource", "date", "start_time", "end_time"],
                name="unique_availability_slot",
            ),
            models.CheckConstraint(
                condition=models.Q(start_time__lt=models.F("end_time")),
                name="availability_start_before_end",
            ),
        ]

    def __str__(self):
        return f"{self.resource.name} {self.date} {self.start_time}-{self.end_time}"
