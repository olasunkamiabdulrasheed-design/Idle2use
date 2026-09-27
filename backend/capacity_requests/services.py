"""Stage 4 business logic: request status lifecycle.

Kept out of serializers/views so the rules exist in exactly one place.

    active ──→ matched ──→ fulfilled
      │          │
      ├→ cancelled ◄──────┘
      └→ expired

fulfilled / cancelled / expired are terminal. Transitions are checked on
every status change so an old request can never silently reactivate.
"""

from .models import CapacityRequest, RequestStatus

ALLOWED_TRANSITIONS = {
    RequestStatus.ACTIVE: {
        RequestStatus.MATCHED,
        RequestStatus.FULFILLED,
        RequestStatus.CANCELLED,
        RequestStatus.EXPIRED,
    },
    RequestStatus.MATCHED: {
        RequestStatus.FULFILLED,
        RequestStatus.CANCELLED,
        RequestStatus.EXPIRED,
    },
    RequestStatus.FULFILLED: set(),
    RequestStatus.CANCELLED: set(),
    RequestStatus.EXPIRED: set(),
}

TERMINAL_STATUSES = frozenset(
    s for s, targets in ALLOWED_TRANSITIONS.items() if not targets
)


def can_transition(current: str, new: str) -> bool:
    if current == new:
        return True  # no-op updates are harmless
    return new in ALLOWED_TRANSITIONS.get(current, set())


def validate_transition(instance: CapacityRequest, new_status: str) -> None:
    """Raise ValueError when a status change would be illegal."""
    if not can_transition(instance.status, new_status):
        raise ValueError(
            f"Cannot change status from '{instance.status}' to '{new_status}'."
        )
