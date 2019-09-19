import ftplib
import logging
import os
from datetime import datetime
from os import path, mkdir

from channels.layers import get_channel_layer
from dateutil.tz import tzlocal
from pywintypes import Time
from win32con import FILE_SHARE_DELETE, FILE_SHARE_READ, GENERIC_WRITE, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, \
    FILE_SHARE_WRITE
from win32file import CreateFile, CloseHandle, SetFileTime, GetFileTime

from AndroidFTPBackup import views
from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTPBackup.models import LastBackup


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

    async def data_backup(self):
        ftp = views.handler.ftpHelper.get_ftp_connection()
        months = eval(views.handler.config[pS.PATH][pS.MONTHS])

        channel = get_channel_layer()
        for a in eval(views.handler.config[pS.PATH][pS.FOLDERS]):
            await self.backup_folder(a, channel, ftp, months)

        await channel.group_send(pS.GROUP_NAME, {
            pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
            pS.MESSAGE: pS.BACKUP_COMPLETED_ON + datetime.now().astimezone(tzlocal()).__str__()
        })
        self.save_date_of_current_backup()
        ftp.close()

    async def backup_folder(self, a, channel, ftp, months):
        response = '* ' + a[0] + '\n'
        await channel.group_send(pS.GROUP_NAME, {
            pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
            pS.MESSAGE: response
        })
        self.create_folder_if_not_exists(a[1])
        self.logger.info(pS.BACKING_UP_.format(a[0]))

        for file in ftp.mlsd(a[0]):
            response = ''
            current_path = a[1]

            if file[1][pS.TYPE_] == pS.DIR:
                if file[0][0] == '.':
                    continue
                new_a = [views.handler.fileHelper.folder_join(a[0], file[0])]
                if not a[3]:
                    new_a.append(views.handler.fileHelper.folder_join(current_path, file[0]))
                else:
                    new_a.append(a[1])
                new_a.append(a[2])
                new_a.append(a[3])
                
                await self.backup_folder(new_a, channel, ftp, months)
                continue
            date_file = datetime.strptime(file[1][pS.MODIFY], pS.TIME_FORMAT)
            if date_file >= datetime.strptime(LastBackup.objects.get_or_create(
                    id=1, defaults={pS.PUB_NAME: pS.INIT_DATE})[0].pub_date, pS.TIME_FORMAT):
                try:
                    if a[2]:
                        year = date_file.year
                        month = date_file.month
                        year_ = views.handler.fileHelper.folder_join(current_path, str(year))
                        month_path = views.handler.fileHelper.folder_join(year_, months[str(month)])
                        file_path = views.handler.fileHelper.folder_join(month_path, file[0])
                        self.create_folder_if_not_exists(year_)
                        self.create_folder_if_not_exists(month_path)
                    else:
                        file_path = views.handler.fileHelper.folder_join(current_path, file[0])

                    if path.exists(file_path):
                        if GetFileTime(file_path) == file[1][pS.MODIFY]:
                            response += pS.ALREADY_EXISTS + file[0] + '\n'
                            self.logger.warning(pS.FILE_ALREADY_EXISTS_.format(file[0]))
                        else:
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

                except PermissionError as pe:
                    response += pS.ERROR_SAVING + file[0] + '\n'
                    self.logger.error(pS.ERROR_SAVING_.format(file[0], pe.__str__()))

                except ftplib.error_perm as ep:
                    response += pS.ERROR_SAVING + file[0] + '\n'
                    self.logger.error(pS.ERROR_SAVING_.format(file[0], ep.__str__()))

            await channel.group_send(pS.GROUP_NAME, {
                pS.TYPE_: pS.ANDROIDFTP_MESSAGE,
                pS.MESSAGE: response
            })

    def create_folder_if_not_exists(self, folder):
        if not path.exists(folder):
            self.logger.info(pS.CREATING_FOLDER.format(folder))
            mkdir(folder)

    def save_date_of_current_backup(self):
        update = datetime.now().astimezone(tzlocal()).strftime(pS.TIME_FORMAT)
        LastBackup.objects.update_or_create(
            id=1, defaults={pS.PUB_NAME: update})
        self.logger.info(pS.BACKUP_UPDATED_ON.format(update))
