"""Stage 9/10 services: booking lifecycle + conflict prevention."""

from datetime import time

from .models import Booking, BookingStatus

ALLOWED = {
    BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.CANCELLED},
    BookingStatus.CONFIRMED: {BookingStatus.COMPLETED, BookingStatus.CANCELLED},
    BookingStatus.COMPLETED: set(),
    BookingStatus.CANCELLED: set(),
}

ACTIVE_STATUSES = {BookingStatus.PENDING, BookingStatus.CONFIRMED}


def validate_transition(booking, new_status):
    if new_status == booking.status:
        return
    if new_status not in ALLOWED.get(booking.status, set()):
        raise ValueError(
            f"Cannot change booking from '{booking.status}' to '{new_status}'."
        )


def find_conflict(resource, day, start, end, exclude_pk=None):
    """Double-booking guard: overlapping non-cancelled slot on same resource."""
    qs = Booking.objects.filter(
        resource=resource,
        date=day,
        status__in=ACTIVE_STATUSES,
        start_time__lt=end,
        end_time__gt=start,
    )
    if exclude_pk:
        qs = qs.exclude(pk=exclude_pk)
    return qs.first()
