import asyncio
import logging
import os
import threading
import uuid
from time import sleep

from pywintypes import Time
from win32con import FILE_SHARE_DELETE, FILE_SHARE_READ, GENERIC_WRITE, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, \
    FILE_SHARE_WRITE
from win32file import CreateFile, CloseHandle, SetFileTime

from AndroidFTPBackup.constants import BackupConstants
from AndroidFTPBackup.helpers.ConfigHelper import ConfigHelper
from AndroidFTPBackup.helpers.FileHelper import FileHelper
from AndroidFTPBackup.helpers.FtpHelper import FtpHelper
from AndroidFTPBackup.model.FtpFile import FtpFile
from AndroidFTPBackup.utils.BackupUtils import BackupUtils


class BackupHelper:
    logger = logging.getLogger(__name__)

    def __init__(self, backup, current_ip):
        self.backup = backup
        self.state = 'Started'
        self.ftp_client = None
        self.current_ip = current_ip
        self.backup_name = backup['config']['basic']['name']
        self.last_backup_end_time = BackupUtils.date_from_timestamp(backup['last_backup_end_time'])
        self.last_backup_start_time = BackupUtils.date_from_timestamp(backup['last_backup_start_time'])
        self.ftp_data = dict(port=backup['config']['ftp']['port'], userId=backup['config']['ftp']['userId'],
                             ip=current_ip, password=backup['config']['ftp']['password'])

    def start_backup(self, backup):
        loop = asyncio.new_event_loop()
        p = threading.Thread(target=self.worker, args=(loop, backup,))
        p.start()

    def worker(self, loop, backup):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.data_backup(backup))

    async def data_backup(self, backup):
        self.ftp_client = await self.connect_ftp()
        self.logger.info("Starting Backup for: {}".format(self.backup_name))
        self.logger.info("Last Backup started on: {}".format(self.last_backup_start_time))
        self.logger.info("Last Backup completed on: {}".format(self.last_backup_end_time))

        current_backup_start_time = BackupUtils.timestamp_from_date()
        for dir_data in backup['config']['dirs']['backupDirs']:
            await self.backup_folder(dir_data)
        current_backup_end_time = BackupUtils.timestamp_from_date()

        self.logger.info("Current Backup started on: {}".format(current_backup_start_time))
        self.logger.info("Current Backup completed on: {}".format(current_backup_end_time))
        self.state = 'Completed'
        await BackupUtils.send_message('Completed', self.backup_name, current_backup_end_time)
        await ConfigHelper.update_backup_time(self.backup_name, current_backup_start_time, current_backup_end_time)

    async def backup_folder(self, dir_config):
        source_path = dir_config['path']
        backup_location = dir_config['backupLocation']
        month_separated = dir_config['monthSeparated']
        recursive = dir_config['recursive']

        FileHelper.create_folder(backup_location)
        await BackupUtils.send_message('Scanning', self.backup_name, source_path, dir_config['backupLocation'])

        num_files = 0
        for file in await self.get_dir_list(source_path):
            file = FtpFile(file)
            await self.validate_process_status(self.backup_name)
            uuid_ = uuid.uuid4().__str__()

            if file.type == 'dir':
                if file.name[0] == '.':
                    continue
                sub_dir_config = dict(path=os.path.join(source_path, file.name),
                                      monthSeparated=month_separated, recursive=recursive,
                                      backupLocation=BackupUtils.get_backup_location(backup_location, file, recursive))
                await self.backup_folder(sub_dir_config)
                continue

            if file.modify < self.last_backup_start_time:
                continue

            try:
                file_path, save = BackupUtils.get_file_path(backup_location, month_separated, file,
                                                            self.last_backup_end_time)
                if save:
                    if num_files == 0:
                        self.logger.info('Backing up: {}'.format(source_path))
                        await BackupUtils.send_message('Enter Directory', self.backup_name,
                                                       source_path, backup_location)
                        num_files += 1
                    await BackupUtils.send_message('Copying', self.backup_name, file.name, file.size, uuid_)
                    await self.create_file(file_path, file.name, file.modify.timestamp(), source_path)
                    await BackupUtils.send_message('Saved', self.backup_name, file_path, file.size, uuid_)
            except Exception as e:
                self.logger.exception('Error saving: {}.'.format(file.name), e)
                await BackupUtils.send_message('Error', self.backup_name, file.name, e.__str__(), uuid_)

    async def validate_process_status(self, backup_name):
        if self.state == 'Cancelled':
            await BackupUtils.send_message('Cancelled', backup_name, BackupUtils.timestamp_from_date())
            raise RuntimeError('Backup stopped by user')

    async def create_file(self, file_name, current_file_name, time, file_path):
        current_file = os.path.join(file_path, current_file_name)
        with open(file_name, "wb") as file:
            await self.get_file(current_file, file.write)
        win_file = CreateFile(file_name, GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
                              None, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, None)
        # noinspection PyUnresolvedReferences
        win_time = Time(time)
        SetFileTime(win_file, win_time, win_time, win_time)
        CloseHandle(win_file)
        self.logger.info('Created file {} with time {}'.format(file_name, win_time))

    async def get_dir_list(self, source_file_path):
        try:
            return list(self.ftp_client.mlsd(source_file_path))
        except Exception as e:
            await self.retry('get_dir_list', e)
            return await self.get_dir_list(source_file_path)

    async def get_file(self, current_file, save_file_callback):
        try:
            return self.ftp_client.retrbinary("RETR {}".format(current_file), save_file_callback)
        except Exception as e:
            await self.retry('get_file', e)
            return await self.get_file(current_file, save_file_callback)

    async def connect_ftp(self, retry_count=1):
        while True:
            try:
                return FtpHelper.connect_ftp(self.ftp_data)
            except Exception as e:
                await self.retry('connect_ftp', e, retry_count)

    async def retry(self, function, e, retry_count=1):
        if retry_count > BackupConstants.MAX_RETRY_COUNT:
            self.state = 'Cancelled'
            await BackupUtils.send_message('Connection Failed', self.backup_name,
                                           'Retry Limit reached, Cancelling Backup.')
            raise RuntimeError('Retry Limit reached, Cancelling Backup.')
        await BackupUtils.send_message('Connection Failed', self.backup_name,
                                       'Retry Count: {}/{}'.format(retry_count, BackupConstants.MAX_RETRY_COUNT))
        self.logger.error('Possible disconnect, retrying... {} {} {}'.format(retry_count, function, str(e)))
        sleep(BackupConstants.RETRY_DELAY)
        self.ftp_client.close()
        self.ftp_client = await self.connect_ftp(retry_count + 1)
