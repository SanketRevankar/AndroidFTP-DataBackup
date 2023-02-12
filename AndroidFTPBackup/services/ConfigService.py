import json

from AndroidFTPBackup.utils.BackupHelper import BackupHelper
from AndroidFTPBackup.utils.ConfigHelper import ConfigHelper


class ConfigService:

    @classmethod
    def save_config(cls, request):
        backup_config = json.loads(request.body.decode())
        ConfigHelper.save_config(backup_config)

        return dict(saved=True)

    @classmethod
    def get_config(cls, backup_name):
        backup = ConfigHelper.load_config(backup_name)

        return dict(config=backup['config'], latest_backup=backup['last_backup_end_time'],
                    backup_started=backup_name in BackupHelper.processes)

    @classmethod
    def get_backups(cls):
        backups = ConfigHelper.load_backups()

        return dict(backups=backups)
