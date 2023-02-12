from django.http import JsonResponse, HttpResponseBadRequest

from AndroidFTPBackup.services.WiFiService import WiFiService


class WiFiApi:
    @classmethod
    def handle(cls, request):
        # POST api/wifi
        if request.method == 'POST':
            response = WiFiService.get_connected_devices(request)
            return JsonResponse(response)

        return HttpResponseBadRequest()
