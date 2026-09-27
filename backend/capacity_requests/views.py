"""Stage 4 API views: CapacityRequest CRUD.

Ownership model: every queryset is scoped to `requester=request.user`, so
another user asking for someone else's private request receives 404 —
the existence of the record is never leaked. Frontend restrictions are
UX only; this is the security boundary.
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import CapacityRequest
from .serializers import CapacityRequestSerializer


class CapacityRequestViewSet(viewsets.ModelViewSet):
    """GET/POST /api/requests/ + GET/PUT/PATCH/DELETE /api/requests/<id>/.

    Lists only the authenticated user's own requests.
    Filtering: ?status=active (or matched/fulfilled/cancelled/expired).
    """

    serializer_class = CapacityRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CapacityRequest.objects.filter(requester=self.request.user)
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)
