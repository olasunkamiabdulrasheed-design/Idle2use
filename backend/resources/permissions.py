"""Stage 3 permissions: backend ownership enforcement.

Frontend hiding is UX only — THESE classes are the real security boundary.
Rule: any authenticated user may READ (MVP decision, documented below);
only the owner may WRITE (PUT/PATCH/DELETE).

MVP read decision: resources are readable by all authenticated users so the
future matching engine / browsing UI has data to work with. Public
(unauthenticated) browsing is intentionally NOT allowed yet — that choice is
deferred until listing/search requirements are defined.
"""

from rest_framework import permissions


class IsOwnerOrAuthenticatedRead(permissions.BasePermission):
    """Object-level gate: reads for any authenticated user, writes for owner.

    Works for Resource (obj.owner) and Availability (obj.resource.owner).
    Must be combined with IsAuthenticated at the view level.
    """

    message = "You do not own this resource."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, "owner", None)
        if owner is None:
            owner = getattr(getattr(obj, "resource", None), "owner", None)
        return owner is not None and owner == request.user
