import asyncio
import ftplib
import logging
import os
import threading
import uuid
from datetime import datetime
from decimal import Decimal
from os import path

from channels.layers import get_channel_layer
from pywintypes import Time
from win32con import FILE_SHARE_DELETE, FILE_SHARE_READ, GENERIC_WRITE, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, \
    FILE_SHARE_WRITE
from win32file import CreateFile, CloseHandle, SetFileTime

from AndroidFTPBackup.model.FtpFile import FtpFile
from AndroidFTPBackup.utils.ConfigHelper import ConfigHelper
from AndroidFTPBackup.utils.FileHelper import FileHelper
from AndroidFTPBackup.utils.FtpHelper import FtpHelper


class BackupHelper:
    logger = logging.getLogger(__name__)
    processes = {}

    @classmethod
    def start_backup(cls, backup, current_ip):
        loop = asyncio.new_event_loop()
        p = threading.Thread(target=cls.worker, args=(loop, backup, current_ip,))
        p.start()

    @classmethod
    def worker(cls, loop, backup, current_ip):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(cls.data_backup(backup, current_ip))

    @classmethod
    async def data_backup(cls, backup, current_ip):
        backup_name = backup['config']['basic']['name']
        cls.logger.info("Starting Backup for: {}".format(backup_name))

        ftp = FtpHelper.connect_ftp(dict(port=backup['config']['ftp']['port'], userId=backup['config']['ftp']['userId'],
                                         ip=current_ip, password=backup['config']['ftp']['password']))

        last_backup_start_time = cls.date_from_timestamp(backup['last_backup_start_time'])
        last_backup_end_time = cls.date_from_timestamp(backup['last_backup_end_time'])
        cls.logger.info("Last Backup started on: {}".format(last_backup_start_time))
        cls.logger.info("Last Backup completed on: {}".format(last_backup_end_time))

        current_backup_start_time = cls.timestamp_from_date()
        for dir_data in backup['config']['dirs']['backupDirs']:
            await cls.backup_folder(ftp, dir_data, backup_name, last_backup_start_time, last_backup_end_time)
        current_backup_end_time = cls.timestamp_from_date()

        cls.logger.info("Current Backup started on: {}".format(current_backup_start_time))
        cls.logger.info("Current Backup completed on: {}".format(current_backup_end_time))
        await cls.send_message('Completed', backup_name, current_backup_end_time)
        await ConfigHelper.update_backup_time(backup_name, current_backup_start_time, current_backup_end_time)
        cls.processes.pop(backup_name, None)
        ftp.close()

    @classmethod
    async def backup_folder(cls, ftp_client, dir_config, backup_name, last_backup_start_time, last_backup_end_time):
        FileHelper.create_folder(dir_config['backupLocation'])
        source_file_path = dir_config['path']
        await cls.send_message('Scanning', backup_name, source_file_path, dir_config['backupLocation'])

        num_files = 0
        for file in ftp_client.mlsd(source_file_path):
            file = FtpFile(file)
            await cls.validate_process_status(backup_name)
            backup_location = dir_config['backupLocation']
            uuid_ = uuid.uuid4().__str__()

            if file.type == 'dir':
                if file.name[0] == '.':
                    continue
                sub_dir_config = dict(path=os.path.join(source_file_path, file.name),
                                      backupLocation=backup_location if dir_config['recursive'] else
                                      os.path.join(backup_location, file.name),
                                      monthSeparated=dir_config['monthSeparated'],
                                      recursive=dir_config['recursive'])

                await cls.backup_folder(ftp_client, sub_dir_config, backup_name, last_backup_start_time,
                                        last_backup_end_time)
                continue

            if file.modify >= last_backup_start_time:
                if num_files == 0:
                    await cls.send_message('EnterDirectory', backup_name, source_file_path, backup_location)
                    cls.logger.info('Backing up: {}'.format(source_file_path))
                    num_files += 1
                try:
                    if dir_config['monthSeparated']:
                        month_path = os.path.join(backup_location, str(file.modify.year),
                                                  str(file.modify.month).zfill(2))
                        file_path = os.path.join(month_path, file.name)
                        FileHelper.create_folder(month_path)
                    else:
                        file_path = os.path.join(backup_location, file.name)

                    await cls.send_message('Copying', backup_name, file.name, file.size, uuid_)
                    if path.exists(file_path):
                        if file.modify >= last_backup_end_time:
                            name, ext = os.path.splitext(file_path)
                            n = 1
                            while 1:
                                suffixed_file_path = '{}_{}{}'.format(name, n, ext)
                                if os.path.exists(suffixed_file_path):
                                    n += 1
                                else:
                                    cls.create_file(ftp_client, suffixed_file_path, file.name, file.modify.timestamp(),
                                                    source_file_path)
                                    await cls.send_message('Saved', backup_name, suffixed_file_path, file.size, uuid_)
                                    break
                    else:
                        cls.create_file(ftp_client, file_path, file.name, file.modify.timestamp(), source_file_path)
                    await cls.send_message('Saved', backup_name, file_path, file.size, uuid_)
                except PermissionError as pe:
                    cls.logger.exception('Error saving: {}.'.format(file.name), pe)
                    await cls.send_message('Error', backup_name, file.name, pe.__str__(), uuid_)
                except ftplib.error_perm as ep:
                    cls.logger.exception('Error saving: {}.'.format(file.name), ep)
                    await cls.send_message('Error', backup_name, file.name, ep.__str__(), uuid_)

    @classmethod
    async def validate_process_status(cls, backup_name):
        if cls.processes[backup_name]['status'] == 'Cancelled':
            await cls.send_message('Cancelled', backup_name, cls.timestamp_from_date())
            cls.processes.pop(backup_name, None)
            raise RuntimeError('Backup stopped by user')

    @classmethod
    def create_file(cls, ftp, file_name, c_file, time, a_path):
        current_file = open(file_name, "wb")
        ftp.retrbinary("RETR {}/{}".format(a_path, c_file), current_file.write)
        current_file.close()
        win_file = CreateFile(file_name, GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
                              None, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, None)
        # noinspection PyUnresolvedReferences
        win_time = Time(time)
        SetFileTime(win_file, win_time, None, None)
        CloseHandle(win_file)
        cls.logger.info('Created file {} with time {}'.format(file_name, win_time))

    @classmethod
    async def send_message(cls, state, backup_name, value, target=None, msg_id=None):
        if msg_id is None:
            msg_id = uuid.uuid4().__str__()

        channel = get_channel_layer()
        await channel.group_send('output', {
            'type': 'AndroidFTPBackup.message',
            'state': state,
            'id': msg_id,
            'backup_name': backup_name,
            'value': value,
            'target': target,
        })

    @classmethod
    def date_from_timestamp(cls, date):
        return datetime.fromtimestamp(153000 if date == '' else float(date)).astimezone()

    @classmethod
    def timestamp_from_date(cls):
        return str(datetime.now().astimezone().timestamp())

    @classmethod
    def is_backup_in_progress(cls, backup_name):
        return backup_name in cls.processes
