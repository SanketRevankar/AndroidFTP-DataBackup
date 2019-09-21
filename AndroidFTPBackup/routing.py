from channels.routing import ProtocolTypeRouter
from django.conf.urls import url
from django.urls import path

from AndroidFTPBackup import consumer

websocket_urlpatterns = [
    url('ws/code/output/$', consumer.AndroidFTPBackupConsumer),
]

application = ProtocolTypeRouter({

})
