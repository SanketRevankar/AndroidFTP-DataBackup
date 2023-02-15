import json

from AndroidFTPBackup.helpers.FileHelper import FileHelper


class FileService:

    @classmethod
    def open_file(cls, request):
        file_path = json.loads(request.body.decode())['filePath']
        FileHelper.open_file(file_path.strip('/'))
        return dict(opened=True)

    @classmethod
    def dashboard_data(cls, request):
        backup_location = json.loads(request.body.decode())['backupLocation']

        return FileHelper.get_data(backup_location)
