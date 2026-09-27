"""Stage 5 persistent-request hooks.

When a provider changes capacity (creates/updates a Resource or
Availability), synchronously re-check all matching ACTIVE requests.
This is the "if capacity becomes available later, Idle2Use finds the
match" behavior — deliberately synchronous, no Celery/Redis for MVP.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from resources.models import Availability, Resource


def _recheck(resource):
    from .services import run_matching_for_resource

    try:
        run_matching_for_resource(resource)
    except Exception:  # noqa: BLE001 — never break a save because matching failed
        pass


@receiver(post_save, sender=Resource)
def resource_saved(sender, instance, **kwargs):
    _recheck(instance)


@receiver(post_save, sender=Availability)
def availability_saved(sender, instance, **kwargs):
    _recheck(instance.resource)
