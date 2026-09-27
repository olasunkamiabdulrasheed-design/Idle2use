"""Stage 3 admin: inspect owners, capacity, status, and time windows."""

from django.contrib import admin

from .models import Availability, Resource


class AvailabilityInline(admin.TabularInline):
    model = Availability
    extra = 0
    fields = ("date", "start_time", "end_time", "status")


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "owner",
        "category",
        "location",
        "capacity",
        "capacity_unit",
        "status",
        "created_at",
    )
    list_filter = ("category", "status")
    search_fields = ("name", "location", "owner__username")
    inlines = [AvailabilityInline]


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("resource", "date", "start_time", "end_time", "status")
    list_filter = ("status", "date")
    search_fields = ("resource__name", "resource__owner__username")
