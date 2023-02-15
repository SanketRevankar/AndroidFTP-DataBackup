import os
import uuid
from datetime import datetime

from channels.layers import get_channel_layer

from AndroidFTPBackup.helpers.FileHelper import FileHelper


class BackupUtils:
    @classmethod
    def date_from_timestamp(cls, date):
        return datetime.fromtimestamp(153000 if date == '' else float(date)).astimezone()

    @classmethod
    def timestamp_from_date(cls):
        return str(datetime.now().astimezone().timestamp())

    @classmethod
    async def send_message(cls, state, backup_name, value, target=None, msg_id=None):
        if msg_id is None:
            msg_id = uuid.uuid4().__str__()

        channel = get_channel_layer()
        message = dict(type='AndroidFTPBackup.message', state=state, id=msg_id, backup_name=backup_name,
                       value=value, target=target)
        await channel.group_send('output', message)

    @classmethod
    def write_ftp_file(cls, file_name, file_bytes):
        with open(file_name, "wb") as file:
            file.write(file_bytes)

    @classmethod
    def is_backup_started(cls, processes, backup_name):
        return backup_name in processes and processes[backup_name].state == 'Started'

    @classmethod
    def get_file_path(cls, backup_location, month_separated, file, last_backup_end_time):
        save = True
        if month_separated:
            month_path = os.path.join(backup_location, str(file.modify.year), str(file.modify.month).zfill(2))
            FileHelper.create_folder(month_path)
            file_path = os.path.join(month_path, file.name)
        else:
            file_path = os.path.join(backup_location, file.name)

        if os.path.exists(file_path):
            if file.modify >= last_backup_end_time:
                file_path = BackupUtils.get_suffixed_file_path(file_path)
            else:
                save = False

        return file_path, save

    @classmethod
    def get_backup_location(cls, backup_location, file, recursive):
        return backup_location if recursive else os.path.join(backup_location, file.name)

    @classmethod
    def get_suffixed_file_path(cls, file_path, n=1):
        name, ext = os.path.splitext(file_path)
        while 1:
            suffixed_file_path = '{}_{}{}'.format(name, n, ext)
            if os.path.exists(suffixed_file_path):
                n += 1
            else:
                return suffixed_file_path
