"""Stage 9/10 views: bookings + reviews with ownership enforcement.

Booking creation comes from a request/resource pair that belongs to the
authenticated requester. Conflicts and transitions are enforced in the
serializer/services — the frontend cannot bypass them.
"""

from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from capacity_requests.models import CapacityRequest
from notifications.models import notify
from resources.models import Resource

from .models import Booking, Review
from .serializers import BookingSerializer, ReviewSerializer
from .services import find_conflict

BLOCKING_STATUSES = {"pending", "confirmed"}


class BookingViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """GET /api/bookings/ (?role=provider), POST /api/bookings/,
    PATCH /api/bookings/<id>/ (status transitions + conflict checks)."""

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related(
            "request", "resource", "requester", "provider"
        ).filter(Q(requester=user) | Q(provider=user))
        if self.request.query_params.get("role") == "provider":
            return qs.filter(provider=user)
        return qs

    def create(self, request, *args, **kwargs):
        capacity_request = CapacityRequest.objects.filter(
            pk=request.data.get("request"), requester=request.user
        ).first()
        if capacity_request is None:
            return self._err("Request not found or not yours.")
        resource = Resource.objects.filter(
            pk=request.data.get("resource"), status="active"
        ).first()
        if resource is None:
            return self._err("Resource not found or inactive.")
        serializer = BookingSerializer(data={
            "date": request.data.get(
                "date", capacity_request.date.isoformat()),
            "start_time": request.data.get(
                "start_time", capacity_request.start_time.strftime("%H:%M")),
            "end_time": request.data.get(
                "end_time", capacity_request.end_time.strftime("%H:%M")),
            "agreed_price": request.data.get("agreed_price", ""),
        })
        serializer.is_valid(raise_exception=True)
        conflict = find_conflict(
            resource, serializer.validated_data["date"],
            serializer.validated_data["start_time"],
            serializer.validated_data["end_time"])
        if conflict:
            raise ValidationError(
                {"date": "The resource is already booked for this period."})
        booking = serializer.save(
            request=capacity_request,
            resource=resource,
            requester=request.user,
            provider=resource.owner,
        )
        notify(
            resource.owner,
            "New booking request",
            f"{request.user.username} requested {resource.name} on "
            f"{booking.date}",
            f"/bookings/{booking.pk}",
        )
        capacity_request.status = "matched"
        capacity_request.save(update_fields=["status", "updated_at"])
        return self._ok(booking)

    def perform_update(self, serializer):
        booking = serializer.instance
        if booking.provider != self.request.user and \
                booking.requester != self.request.user:
            raise PermissionDenied("Not your booking.")
        previous = booking.status
        booking = serializer.save()
        if previous != booking.status:
            other = (booking.provider if booking.requester == self.request.user
                     else booking.requester)
            notify(
                other,
                f"Booking {booking.status}",
                f"{booking.resource.name} on {booking.date} is now "
                f"{booking.status}.",
                f"/bookings/{booking.pk}",
            )

    def _err(self, msg):
        from rest_framework.response import Response
        return Response({"detail": msg}, status=400)

    def _ok(self, booking):
        from rest_framework.response import Response
        return Response(BookingSerializer(booking).data, status=201)


class ReviewViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                    viewsets.GenericViewSet):
    """GET /api/reviews/ (?user=<id>), POST /api/reviews/.

    Only a participant of a COMPLETED booking may review; one review per
    booking (DB OneToOne + check here).
    """

    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Review.objects.select_related("reviewer", "reviewee", "booking")
        user = self.request.query_params.get("user")
        if user:
            return qs.filter(reviewee_id=user)
        return qs.filter(
            booking__in=Booking.objects.filter(
                requester=self.request.user
            ) | Booking.objects.filter(provider=self.request.user)
        )

    def create(self, request, *args, **kwargs):
        booking = Booking.objects.filter(
            pk=request.data.get("booking"), status="completed"
        ).first()
        if booking is None:
            return self._err("Only completed bookings can be reviewed.")
        if request.user not in (booking.requester, booking.provider):
            raise PermissionDenied("You are not part of this booking.")
        if Review.objects.filter(booking=booking, reviewer=request.user).exists():
            return self._err("You already reviewed this booking.")
        reviewee = (booking.provider if booking.requester == request.user
                    else booking.requester)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(
            booking=booking, reviewer=request.user, reviewee=reviewee)
        notify(
            reviewee,
            "You received a review",
            f"{request.user.username} rated your booking "
            f"{review.rating}/5.",
            f"/reviews",
        )
        return Response201(review)

    def _err(self, msg):
        from rest_framework.response import Response
        return Response({"detail": msg}, status=400)


def Response201(obj):
    from rest_framework.response import Response
    return Response(ReviewSerializer(obj).data, status=201)
