from datetime import datetime
from zoneinfo import ZoneInfo

from AndroidFTPBackup.constants import BackupConstants


class FtpFile:
    def __init__(self, file):
        self.name = file[0]
        self.type = file[1]['type']
        self.size = file[1]['size']
        self.modify = datetime.strptime(file[1]['modify'], BackupConstants.TIME_FORMAT) \
            .replace(tzinfo=ZoneInfo('UTC')).astimezone()
