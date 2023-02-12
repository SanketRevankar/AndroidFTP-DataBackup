from django.http import JsonResponse, HttpResponseBadRequest

from AndroidFTPBackup.services.FtpService import FtpService


class FtpApi:
    @classmethod
    def handle(cls, request, operation=None):
        response = None

        if operation == 'refreshIp':
            # POST api/ftp/refreshIp
            if request.method == 'POST':
                response = FtpService.refresh_ip(request)

        if operation == 'test':
            # POST api/ftp/test
            if request.method == 'POST':
                response = FtpService.test_ftp(request)

        if operation == 'loadDirData':
            # POST api/ftp/loadDirData
            if request.method == 'POST':
                response = FtpService.load_dir_data(request)

        if response:
            return JsonResponse(response)
        return HttpResponseBadRequest()
