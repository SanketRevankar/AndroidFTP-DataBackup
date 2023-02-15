import json

from AndroidFTPBackup.helpers.ConfigHelper import ConfigHelper
from AndroidFTPBackup.services.BackupService import BackupService
from AndroidFTPBackup.utils.BackupUtils import BackupUtils


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
                    backup_started=BackupUtils.is_backup_started(BackupService.processes, backup_name))

    @classmethod
    def get_backups(cls):
        backups = ConfigHelper.load_backups()

        return dict(backups=backups)
