import logging

from AndroidFTPBackup.constants import HtmlStrings, PyStrings
from AndroidFTPBackup.models import LastBackup
from AndroidFTPBackup.utils import *

class Handler:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info('{} - Initiated'.format(__name__))
        self.latest_backup = None
        try:
            self.latest_backup = LastBackup.objects.get(id=1)
        except LastBackup.DoesNotExist:
            pass
        self.context = {
            'latest_backup': self.latest_backup,
        }
        self.configHelper = ConfigHelper.ConfigHelper()
        self.config = self.configHelper.get_config()
        self.fileHelper = FileHelper.FileHelper()
        self.htmlHelper = HtmlHelper.HtmlHelper()
        self.wiFiHelper = WiFiHelper.WiFiHelper()
        self.ftpHelper = FtpHelper.FtpHelper()
        self.backupHelper = BackupHelper.BackupHelper()
        self.htmlStrings = HtmlStrings
        self.pyStrings = PyStrings

    def get_context(self):
        return self.context
