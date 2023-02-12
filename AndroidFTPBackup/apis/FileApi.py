from django.http import JsonResponse, HttpResponseBadRequest

from AndroidFTPBackup.services.FileService import FileService


class FileApi:
    @classmethod
    def handle(cls, request, operation=None):
        response = None

        if operation == 'open':
            # POST api/file/open
            if request.method == 'POST':
                response = FileService.open_file(request)

        if operation == 'data':
            # POST api/file/data
            if request.method == 'POST':
                response = FileService.dashboard_data(request)

        if response:
            return JsonResponse(response)
        return HttpResponseBadRequest()
