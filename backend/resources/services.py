"""Stage 3 business logic: availability rules live here, not in React.

Views call these helpers; serializers surface the errors as 400 responses.
Half-open interval semantics: [start, end) — touching periods such as
09:00-14:00 and 14:00-18:00 do NOT overlap.
"""

from .models import Availability, ResourceStatus


class AvailabilityConflict(Exception):
    """Raised when a slot is a duplicate of or overlaps an existing one."""


def find_overlapping(resource, slot_date, start, end, exclude_id=None):
    """Return queryset of slots on the same resource+date that overlap.

    Overlap (half-open): existing.start < new.end AND existing.end > new.start.
    """
    qs = Availability.objects.filter(resource=resource, date=slot_date)
    if exclude_id is not None:
        qs = qs.exclude(pk=exclude_id)
    return qs.filter(start_time__lt=end, end_time__gt=start)


def validate_availability_slot(resource, slot_date, start, end, exclude_id=None):
    """Enforce rules 1, 4, 5, 6 of the availability spec.

    Raises ValueError (bad times / inactive resource) or
    AvailabilityConflict (duplicate / overlap) with a human message.
    """
    if start >= end:
        raise ValueError("start_time must be before end_time.")
    # Rule 4: never schedule new availability on an inactive resource.
    # (Refresh from DB so a just-deactivated resource is caught.)
    resource.refresh_from_db()
    if resource.status != ResourceStatus.ACTIVE:
        raise ValueError("Cannot add availability to an inactive resource.")
    conflicts = find_overlapping(resource, slot_date, start, end, exclude_id)
    for existing in conflicts:
        if existing.start_time == start and existing.end_time == end:
            raise AvailabilityConflict(
                "This exact availability period already exists."
            )
    if conflicts.exists():
        raise AvailabilityConflict(
            "This period overlaps an existing availability "
            f"({conflicts.first().start_time}-{conflicts.first().end_time})."
        )


def set_resource_status(resource, new_status):
    """Activate/deactivate a resource. Deactivation never deletes data."""
    resource.status = new_status
    resource.save(update_fields=["status", "updated_at"])
    return resource
