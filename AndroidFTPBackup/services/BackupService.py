import json
import logging

from AndroidFTPBackup.helpers.BackupHelper import BackupHelper
from AndroidFTPBackup.helpers.ConfigHelper import ConfigHelper
from AndroidFTPBackup.utils.BackupUtils import BackupUtils


class BackupService:
    logger = logging.getLogger(__name__)
    processes = {}

    @classmethod
    def start_backup(cls, request):
        backup_name = json.loads(request.body.decode())['backupName']
        current_ip = json.loads(request.body.decode())['currentIp']

        if BackupUtils.is_backup_started(cls.processes, backup_name):
            return dict(state='Backup already started')

        backup = ConfigHelper.load_config(backup_name, False)
        backupHelper = BackupHelper(backup, current_ip)
        try:
            cls.logger.info('Starting Backup Thread')
            backupHelper.start_backup(backup)
            cls.processes[backup_name] = backupHelper
        except RuntimeError as re:
            cls.logger.exception('Exception while starting Backup Thread', re)
            raise re

        return dict(state='Initiating Backup')
    
    @classmethod
    def cancel_backup(cls, request):
        backup_name = json.loads(request.body.decode())['backupName']
        if backup_name in cls.processes:
            cls.processes[backup_name].state = 'Cancelled'
    
        return dict(state='Cancelling Backup')
