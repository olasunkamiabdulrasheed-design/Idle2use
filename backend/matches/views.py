"""Stage 5 API views: run/read matches for a request; browse my matches.

Ownership: request matches are visible only to the requester; provider
role can see matches that involve their own resources (?role=provider).
"""

from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from capacity_requests.models import CapacityRequest

from .models import Match
from .serializers import MatchSerializer
from .services import run_matching_for_request


class RequestMatchesView(APIView):
    """GET/POST /api/requests/<id>/matches/ — list or (re)run matching.

    POST synchronously runs the engine and returns persisted matches.
    Only the requester of the request may call this.
    """

    permission_classes = [IsAuthenticated]

    def _get_request(self, request, pk):
        try:
            obj = CapacityRequest.objects.get(pk=pk)
        except CapacityRequest.DoesNotExist:
            return None
        if obj.requester != request.user:
            raise PermissionDenied("You do not own this request.")
        return obj

    def get(self, request, pk):
        obj = self._get_request(request, pk)
        if obj is None:
            return Response({"detail": "Not found."}, status=404)
        matches = Match.objects.filter(request=obj).order_by("-score")
        return Response(MatchSerializer(matches, many=True).data)

    def post(self, request, pk):
        obj = self._get_request(request, pk)
        if obj is None:
            return Response({"detail": "Not found."}, status=404)
        matches = run_matching_for_request(obj)
        return Response(MatchSerializer(matches, many=True).data)


class MatchViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """GET /api/matches/ (requester role) or ?role=provider (my resources).

    PATCH can update `status` (new → viewed/dismissed).
    """

    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Match.objects.select_related(
            "request", "request__requester", "resource", "resource__owner"
        ).all()
        if self.request.query_params.get("role") == "provider":
            return qs.filter(resource__owner=self.request.user)
        return qs.filter(request__requester=self.request.user)

    def perform_update(self, serializer):
        match = serializer.instance
        if match.request.requester != self.request.user:
            raise PermissionDenied("You do not own this match.")
        # Only status is meaningful to update (serializer fields are read-only
        # except status), so accept it via partial update.
        serializer.save()
