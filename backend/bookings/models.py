"""Stage 9/10: Booking (agreement) + Review (trust).

    CapacityRequest >── Booking <── Resource
                        └── Review (one per completed booking)

No payments — price is stored as agreed information only.
"""

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from capacity_requests.models import CapacityRequest
from resources.models import Resource


class BookingStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    CONFIRMED = "confirmed", "Confirmed"
    CANCELLED = "cancelled", "Cancelled"
    COMPLETED = "completed", "Completed"


class Booking(models.Model):
    request = models.ForeignKey(
        CapacityRequest, on_delete=models.CASCADE, related_name="bookings"
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="bookings"
    )
    requester = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookings_made"
    )
    provider = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookings_received"
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    agreed_price = models.CharField(
        max_length=100, blank=True,
        help_text="Free-text agreed amount (no payments in MVP).",
    )
    status = models.CharField(
        max_length=10, choices=BookingStatus.choices, default=BookingStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(start_time__lt=models.F("end_time")),
                name="booking_start_before_end",
            ),
        ]

    def __str__(self):
        return f"Booking #{self.pk} [{self.status}]"


class Review(models.Model):
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="review"
    )
    reviewer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reviews_written"
    )
    reviewee = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reviews_received"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.rating}★ by {self.reviewer.username}"
