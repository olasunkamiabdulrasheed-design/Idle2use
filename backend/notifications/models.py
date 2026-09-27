"""Stage 7: in-app notifications + the notify() helper used across apps."""

from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=200)
    body = models.CharField(max_length=500, blank=True)
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.username}: {self.title}"


def notify(recipient, title, body="", link=""):
    """Create a notification. Failures never break the calling flow."""
    try:
        return Notification.objects.create(
            recipient=recipient, title=title, body=body, link=link
        )
    except Exception:  # noqa: BLE001
        return None
