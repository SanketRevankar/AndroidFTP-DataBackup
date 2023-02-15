import json
import logging

from asgiref.sync import sync_to_async

from AndroidFTPBackup.helpers.FileHelper import FileHelper


class ConfigHelper:
    logger = logging.getLogger(__name__)
    configs = {}
    backups = None

    @classmethod
    def load_config(cls, backup_name, init=True, override=False):
        from AndroidFTPBackup.models import Backup

        if backup_name in cls.configs:
            return cls.configs[backup_name]

        cls.logger.info('Loading config: {}'.format(backup_name))
        backup = Backup.objects.filter(name=backup_name).values()[0]
        cls.configs[backup_name] = backup
        config = json.loads(backup['config'])
        backup['config'] = config

        if init:
            FileHelper.async_init(backup['location'], override)

        return backup

    @classmethod
    def load_backups(cls):
        from AndroidFTPBackup.models import Backup

        if cls.backups:
            return cls.backups

        cls.logger.info('Loading all backups')
        backups = Backup.objects.all().values('name')
        backups = [backup['name'] for backup in backups]
        cls.backups = backups

        return backups

    @classmethod
    def save_config(cls, config_data):
        from AndroidFTPBackup.models import Backup

        backup_name = config_data['basic']['name']
        backup_location = config_data['basic']['location']
        cls.logger.info('Saving config: {}'.format(backup_name))
        updates = dict(location=backup_location, config=json.dumps(config_data))
        Backup.objects.update_or_create(name=backup_name, defaults=updates)
        FileHelper.create_folder(backup_location)
        cls.clear_backup_config_cache(backup_name)

    @classmethod
    @sync_to_async
    def update_backup_time(cls, backup_name, current_backup_start_time, current_backup_end_time):
        from AndroidFTPBackup.models import Backup

        cls.logger.info('Updating config: {}'.format(backup_name))
        updates = dict(last_backup_start_time=current_backup_start_time, last_backup_end_time=current_backup_end_time)
        Backup.objects.update_or_create(name=backup_name, defaults=updates)
        cls.clear_backup_config_cache(backup_name)
        cls.load_config(backup_name, True, True)

    @classmethod
    def clear_backup_config_cache(cls, backup_name):
        cls.configs.pop(backup_name, None)
        if cls.backups and backup_name not in cls.backups:
            cls.backups = None
