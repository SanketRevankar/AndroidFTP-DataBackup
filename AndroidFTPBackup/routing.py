from channels.routing import ProtocolTypeRouter
from django.urls import re_path

from AndroidFTPBackup import consumer

websocket_urlpatterns = [
    re_path('ws/code/output/$', consumer.AndroidFTPBackupConsumer.as_asgi()),
]

application = ProtocolTypeRouter({

})
