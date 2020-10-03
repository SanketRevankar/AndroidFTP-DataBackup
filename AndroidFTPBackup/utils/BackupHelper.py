import ftplib
import logging
import os
import uuid
from datetime import datetime
from os import path
from win32file import CreateFile, CloseHandle, SetFileTime

from channels.layers import get_channel_layer
from dateutil.tz import tzlocal
from pytz import UTC
from pywintypes import Time
from win32con import FILE_SHARE_DELETE, FILE_SHARE_READ, GENERIC_WRITE, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, \
    FILE_SHARE_WRITE

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTP_Backup import handler


class BackupHelper:
    def __init__(self):
        self.temp_file = None
        self.logger = logging.getLogger(__name__)
        self.logger.info(pS.LOG_INIT.format(__name__))

    def create_file(self, file_name, c_file, time, a_path, ftp):
        current_file = open(file_name, "wb")
        ftp.retrbinary(pS.RETR + a_path + "/" + c_file, current_file.write)
        current_file.close()
        win_file = CreateFile(
            file_name, GENERIC_WRITE,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            None, OPEN_EXISTING,
            FILE_ATTRIBUTE_NORMAL, None)
        # noinspection PyUnresolvedReferences
        win_time = Time(time)
        SetFileTime(win_file, win_time, None, None)
        CloseHandle(win_file)
        self.logger.info(pS.FILE_CREATED_AT_TIME.format(file_name, win_time))

    async def data_backup(self, backup_name):
        handler.configHelper.load_config(backup_name, False)
        config = handler.configHelper.get_config()

        ftp = handler.ftpHelper.get_ftp_connection()
        months = eval(config[pS.PATH][pS.MONTHS])
        last_updated = self.get_last_backup(backup_name)

        channel = get_channel_layer()
        for a in eval(config[pS.PATH][pS.FOLDERS]):
            await self.backup_folder(a, channel, ftp, months, backup_name, last_updated)

        date_now = datetime.now().astimezone(tzlocal()).__str__()
        await channel.group_send(pS.GROUP_NAME, {
            pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
            pS.MESSAGE: pS.BACKUP_COMPLETED_ON + date_now,
            'state': 'Completed',
            'value': date_now,
            'backup_name': backup_name,
        })
        handler.fileHelper.async_init()
        del handler.apiHelper.processes[backup_name]
        self.save_date_of_current_backup(backup_name)
        ftp.close()

    async def backup_folder(self, a, channel, ftp, months, backup_name, last_updated):
        handler.fileHelper.create_folder_if_not_exists(self.logger, a[1])

        c = 0

        for file in ftp.mlsd(a[0]):
            if handler.apiHelper.processes[backup_name]['status'] == 'stop':
                await channel.group_send(pS.GROUP_NAME, {
                    pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                    'state': 'Cancelled',
                    'backup_name': backup_name,
                })
                del handler.apiHelper.processes[backup_name]
                raise RuntimeError('Backup stopped by user')
            response = ''
            current_path = a[1]
            uuid_ = uuid.uuid4().__str__()

            if file[1][pS.TYPE_] == pS.DIR:
                if file[0][0] == '.':
                    continue
                new_a = [handler.fileHelper.folder_join(a[0], file[0])]
                if not a[3]:
                    new_a.append(handler.fileHelper.folder_join(current_path, file[0]))
                else:
                    new_a.append(a[1])
                new_a.append(a[2])
                new_a.append(a[3])

                await self.backup_folder(new_a, channel, ftp, months, backup_name, last_updated)
                continue
            date_file = datetime.strptime(file[1][pS.MODIFY], pS.TIME_FORMAT).replace(tzinfo=UTC).astimezone(tzlocal())
            if date_file >= last_updated:
                if c == 0:
                    response = '* ' + a[0] + '\n'
                    await channel.group_send(pS.GROUP_NAME, {
                        pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                        pS.MESSAGE: response,
                        'state': 'Enter Directory',
                        'value': a[0],
                        'backup_name': backup_name,
                    })
                    self.logger.info(pS.BACKING_UP_.format(a[0]))
                    c += 1

                try:
                    if a[2]:
                        year = date_file.year
                        month = date_file.month
                        year_ = handler.fileHelper.folder_join(current_path, str(year))
                        month_path = handler.fileHelper.folder_join(year_, months[str(month)])
                        file_path = handler.fileHelper.folder_join(month_path, file[0])
                        handler.fileHelper.create_folder_if_not_exists(self.logger, year_)
                        handler.fileHelper.create_folder_if_not_exists(self.logger, month_path)
                    else:
                        file_path = handler.fileHelper.folder_join(current_path, file[0])

                    await channel.group_send(pS.GROUP_NAME, {
                        pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                        'id': uuid_,
                        'state': 'Copying',
                        'value': file[0],
                        'target': file_path,
                        'backup_name': backup_name,
                    })

                    if path.exists(file_path):
                        name, ext = os.path.splitext(file_path)
                        n = 1
                        while 1:
                            if os.path.exists(pS.FOLDER_NUM_APPEND.format(name, n, ext)):
                                n += 1
                            else:
                                self.create_file(pS.FOLDER_NUM_APPEND.format(name, n, ext), file[0],
                                                 date_file.timestamp(), a[0], ftp)
                                break
                    else:
                        self.create_file(file_path, file[0], date_file.timestamp(), a[0], ftp)
                        response += pS.ADDED_TO.format(file[0], file_path)

                    await channel.group_send(pS.GROUP_NAME, {
                        pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                        pS.MESSAGE: response,
                        'id': uuid_,
                        'state': 'Saved',
                        'value': file,
                        'backup_name': backup_name,
                    })

                except PermissionError as pe:
                    response += pS.ERROR_SAVING + file[0] + '\n'
                    self.logger.error(pS.ERROR_SAVING_.format(file[0], pe.__str__()))
                    await channel.group_send(pS.GROUP_NAME, {
                        pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                        'id': uuid_,
                        'state': 'Error',
                        'target': pe.__str__(),
                        'backup_name': backup_name,
                    })

                except ftplib.error_perm as ep:
                    response += pS.ERROR_SAVING + file[0] + '\n'
                    self.logger.error(pS.ERROR_SAVING_.format(file[0], ep.__str__()))
                    await channel.group_send(pS.GROUP_NAME, {
                        pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                        'id': uuid_,
                        'state': 'Error',
                        'target': ep.__str__(),
                        'backup_name': backup_name,
                    })

    @staticmethod
    def get_last_backup(backup_name):
        from AndroidFTPBackup.models import LastBackup

        date = LastBackup.objects.get_or_create(id=backup_name,
                                                defaults={pS.PUB_NAME: pS.INIT_DATE})[0].pub_date
        return datetime.strptime(str(date), pS.TIME_FORMAT).astimezone(tzlocal())

    def save_date_of_current_backup(self, backup_name):
        from AndroidFTPBackup.models import LastBackup

        update = datetime.now().astimezone(tzlocal()).strftime(pS.TIME_FORMAT)
        LastBackup.objects.update_or_create(id=backup_name,
                                            defaults={pS.PUB_NAME: update})
        self.logger.info(pS.BACKUP_UPDATED_ON.format(update))
