import json

from channels.generic.websocket import AsyncWebsocketConsumer


class AndroidFTPBackupConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.channel_layer.group_add('output', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('output', self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.channel_layer.group_send("output", dict(type='AndroidFTPBackup.message', message=message))

    # noinspection PyPep8Naming
    async def AndroidFTPBackup_message(self, event):
        await self.send(json.dumps(event))
