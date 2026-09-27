"""Stage 1 API views: health check only (no apps yet)."""

from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request):
    """Verify the API is reachable. Used by the frontend smoke test."""
    return Response({"status": "ok", "service": "Idle2Use API"})
