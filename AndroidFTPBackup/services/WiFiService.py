import json

from AndroidFTPBackup.helpers.WiFiHelper import WiFiHelper


class WiFiService:
    @classmethod
    def get_connected_devices(cls, request):
        ip_range = json.loads(request.body.decode())['ipRange']
        devices = WiFiHelper.get_connected_devices(ip_range)

        return dict(devices=devices)
