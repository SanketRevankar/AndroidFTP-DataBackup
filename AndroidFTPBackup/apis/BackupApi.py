from django.http import JsonResponse, HttpResponseBadRequest

from AndroidFTPBackup.services.BackupService import BackupService


class BackupApi:
    @classmethod
    def handle(cls, request, operation=None):
        response = None

        if operation == 'start':
            # POST api/backup/start
            if request.method == 'POST':
                response = BackupService.start_backup(request)

        if operation == 'cancel':
            # POST api/backup/cancel
            if request.method == 'POST':
                response = BackupService.cancel_backup(request)

        if response:
            return JsonResponse(response)
        return HttpResponseBadRequest()
