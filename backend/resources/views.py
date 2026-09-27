"""Stage 3 API views: Resource CRUD + nested Availability endpoints.

Flow per request: URL -> View -> Authentication (JWT) -> Permission /
ownership check -> Serializer -> services.py -> ORM -> DB -> JSON.
"""

from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Availability, Resource
from .permissions import IsOwnerOrAuthenticatedRead
from .serializers import AvailabilitySerializer, ResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    """GET/POST /api/resources/ + GET/PUT/PATCH/DELETE /api/resources/<id>/.

    Reads: any authenticated user (MVP browsing decision, see permissions).
    Writes: owner only (IsOwnerOrAuthenticatedRead). Owner is server-set.
    Filtering: ?category=space&status=active&location=Ikeja
    (location is a case-insensitive substring match; no geo search yet).
    """

    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAuthenticatedRead]

    def get_queryset(self):
        qs = Resource.objects.select_related("owner").all()
        params = self.request.query_params
        if params.get("category"):
            qs = qs.filter(category=params["category"])
        if params.get("status"):
            qs = qs.filter(status=params["status"])
        if params.get("location"):
            qs = qs.filter(location__icontains=params["location"])
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ResourceAvailabilityView(generics.ListCreateAPIView):
    """GET/POST /api/resources/<resource_id>/availability/.

    GET: any authenticated user. POST: resource owner only (403 otherwise).
    404 when the resource does not exist (rule 2).
    """

    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_resource(self):
        if not hasattr(self, "_resource"):
            self._resource = get_object_or_404(Resource, pk=self.kwargs["resource_id"])
        return self._resource

    def get_queryset(self):
        return (
            Availability.objects.filter(resource=self.get_resource())
            .select_related("resource")
            .order_by("date", "start_time")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["resource"] = self.get_resource()
        return context

    def perform_create(self, serializer):
        resource = self.get_resource()
        if resource.owner != self.request.user:
            raise PermissionDenied("You do not own this resource.")
        serializer.save(resource=resource)


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/availability/<id>/.

    Reads: any authenticated user. Writes: owner of the parent resource.
    """

    queryset = Availability.objects.select_related("resource").all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAuthenticatedRead]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["resource"] = self.get_object().resource
        return context
