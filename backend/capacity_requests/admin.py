"""Stage 4 admin: inspect who needs what, where, and request status."""

from django.contrib import admin

from .models import CapacityRequest


@admin.register(CapacityRequest)
class CapacityRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "requester",
        "category",
        "resource_type",
        "location",
        "capacity_required",
        "date",
        "status",
        "created_at",
    )
    list_filter = ("status", "category")
    search_fields = ("requester__username", "location", "purpose")
    readonly_fields = ("created_at", "updated_at")
