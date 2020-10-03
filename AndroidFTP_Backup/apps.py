from django.apps import AppConfig

from AndroidFTPBackup.utils import ConfigHelper, FileHelper, WiFiHelper, FtpHelper, BackupHelper
from AndroidFTP_Backup import handler


class MyAppConfig(AppConfig):
    name = 'AndroidFTP_Backup'

    def ready(self):
        handler.fileHelper = FileHelper.FileHelper()
        handler.configHelper = ConfigHelper.ConfigHelper()
        handler.wiFiHelper = WiFiHelper.WiFiHelper()
        handler.ftpHelper = FtpHelper.FtpHelper()
        handler.backupHelper = BackupHelper.BackupHelper()
