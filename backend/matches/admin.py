"""Stage 5 admin: inspect scored matches."""

from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("id", "request", "resource", "score", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("request__location", "resource__name")
