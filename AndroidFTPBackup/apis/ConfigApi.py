from django.http import JsonResponse, HttpResponseBadRequest

from AndroidFTPBackup.services.ConfigService import ConfigService


class ConfigApi:
    @classmethod
    def handle(cls, request, name=None):
        response = None

        if name is None:
            # GET api/config
            if request.method == 'GET':
                response = ConfigService.get_backups()
            # POST api/config
            if request.method == 'POST':
                response = ConfigService.save_config(request)
        else:
            # GET api/config/:name
            if request.method == 'GET':
                response = ConfigService.get_config(name)

        if response:
            return JsonResponse(response)
        return HttpResponseBadRequest()
