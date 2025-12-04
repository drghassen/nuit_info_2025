"""
ASGI config for nuit_info project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import iot.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nuit_info.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(
        iot.routing.websocket_urlpatterns
    ),
})
