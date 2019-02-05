import ftplib
import re

from datetime import datetime
from os import path, mkdir, remove

from pywintypes import Time
from win32file import CreateFile, CloseHandle, SetFileTime
from win32con import FILE_SHARE_DELETE, FILE_SHARE_READ, GENERIC_WRITE, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, \
    FILE_SHARE_WRITE

from DataBackup import config


def validate_filename():
    if re.search('[:/\\\\?*<>|"]', config.UPDATE_DATE_TXT.split('/')[-1]):
        print('Invalid Filename.')
        exit(1)


def get_date_of_last_backup():
    current_date = None
    validate_filename()
    try:
        file_date = open(config.UPDATE_DATE_TXT)
        for line in file_date:
            current_date = datetime.strptime(line.strip(), '%Y-%m-%d %H:%M:%S.%f')
        file_date.close()
    except FileNotFoundError:
        print('No old backup date found. Backing up everything.')
        current_date = datetime.strptime('19000101000000.000', '%Y%m%d%H%M%S.000')

    return current_date


def create_file(file_name, c_file, time, a_path, ftp):
    current_file = open(file_name, "wb")
    ftp.retrbinary("RETR " + a_path + "/" + c_file, current_file.write)
    print('\tAdded:', file_name)
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


def data_backup(date, ftp):
    for a in config.FOLDERS:
        print('*', a[0])
        for file in ftp.mlsd(a[0]):
            if file[1]['type'] == 'dir':
                continue
            date_file = datetime.strptime(file[1]['modify'], '%Y%m%d%H%M%S.000')
            if date_file >= date:
                year = date_file.year
                month = date_file.month
                current_path = a[1]
                if not path.exists(current_path + config.CON + str(year)):
                    mkdir(current_path + config.CON + str(year))
                if not path.exists(current_path + config.CON + str(year) + config.CON + config.MONTHS[str(month)]):
                    mkdir(current_path + config.CON + str(year) + config.CON + config.MONTHS[str(month)])
                if path.exists(current_path + config.CON + str(year) + config.CON + config.MONTHS[str(month)] +
                               config.CON + file[0]):
                    print('\tDuplicate: ', file[0])
                    continue
                try:
                    if a.__len__() == 3:
                        create_file(current_path + config.CON + file[0], file[0], date_file.timestamp(), a[0], ftp)
                    else:
                        create_file(current_path + config.CON + str(year) + config.CON + config.MONTHS[str(month)] +
                                    config.CON + file[0], file[0], date_file.timestamp(), a[0], ftp)
                except PermissionError:
                    print(file)


def whatsapp_db_backup(ftp):
    if 'Y' == input('* WhatsApp Backup? [Y/n]: '):
        print('* WhatsApp Backup')
        try:
            print('\tDeleting Old Backup:', config.MSGSTORE_DB_CRYPT_DEST_)
            remove(config.MSGSTORE_DB_CRYPT_DEST_)
        except FileNotFoundError:
            pass
        print('\tCopying current Backup: ' + config.MSGSTORE_DB_CRYPT_)
        f = open(config.MSGSTORE_DB_CRYPT_DEST_, "wb")
        try:
            ftp.retrbinary("RETR " + config.MSGSTORE_DB_CRYPT_, f.write)
        except ftplib.error_perm:
            print('Whatsapp database not found. Check the path in config.')
        f.close()
        print('\tAdded:', config.MSGSTORE_DB_CRYPT_DEST_)


def save_date_of_current_backup():
    file_update = open(config.UPDATE_DATE_TXT, 'w')
    file_update.write(str(datetime.now()))
    file_update.close()


def get_ip(n):
    ip = input('Enter new IP: ')
    if re.match('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', ip):
        return ip
    else:
        print('Enter valid IP.')
        if n > 0:
            return get_ip(n-1)
        else:
            exit(1)


def confirm_ip():
    ip = config.IP

    if input('IP is set to to: {}. Change? [Y/n] '.format(ip)) == 'Y':
        return get_ip(3)
    else:
        return ip


def auth_failed():
    print('Authentication failed. Check the username and/or password.')
    exit(1)


def connection_failed():
    print('Connection Failed. Recheck the IP and try again.')
    exit(1)
