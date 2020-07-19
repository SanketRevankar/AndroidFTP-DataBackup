from django.apps import AppConfig

from AndroidFTPBackup.utils import ConfigHelper, FileHelper, HtmlHelper, WiFiHelper, FtpHelper, BackupHelper
from AndroidFTP_Backup import handler


class MyAppConfig(AppConfig):
    name = 'AndroidFTP_Backup'

    def ready(self):
        configHelper = ConfigHelper.ConfigHelper()
        handler.config = configHelper.get_config()

        handler.fileHelper = FileHelper.FileHelper()
        handler.htmlHelper = HtmlHelper.HtmlHelper()
        handler.wiFiHelper = WiFiHelper.WiFiHelper()
        handler.ftpHelper = FtpHelper.FtpHelper()
        handler.backupHelper = BackupHelper.BackupHelper()
