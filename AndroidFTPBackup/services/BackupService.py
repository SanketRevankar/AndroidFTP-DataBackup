import json
import logging

from AndroidFTPBackup.utils.BackupHelper import BackupHelper
from AndroidFTPBackup.utils.ConfigHelper import ConfigHelper


class BackupService:
    logger = logging.getLogger(__name__)

    @classmethod
    def start_backup(cls, request):
        backup_name = json.loads(request.body.decode())['backupName']
        current_ip = json.loads(request.body.decode())['currentIp']

        if backup_name in BackupHelper.processes:
            return dict(state='Backup already started')

        backup = ConfigHelper.load_config(backup_name, False)
        try:
            cls.logger.info('Starting Backup Thread')
            BackupHelper.start_backup(backup, current_ip)
            BackupHelper.processes[backup_name] = dict(status='Started')
        except RuntimeError as re:
            cls.logger.exception('Exception while starting Backup Thread', re)
            raise re

        return dict(state='Initiating Backup')
    
    @classmethod
    def cancel_backup(cls, request):
        backup_name = json.loads(request.body.decode())['backupName']
        if backup_name in BackupHelper.processes:
            BackupHelper.processes[backup_name]['status'] = 'Cancelled'
    
        return dict(state='Cancelling Backup')
