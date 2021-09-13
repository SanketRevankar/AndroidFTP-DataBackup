import ftplib
import logging

import AndroidFTPBackup.constants.PyStrings as pS
from AndroidFTP_Backup import handler


class FtpHelper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def test_wifi_connection(self, ip, port, user, pass_):
        ftp = ftplib.FTP()
        result = self.ftp_connect(ftp, ip, port, user, pass_)
        if result == 0:
            ftp.close()
        return result

    @staticmethod
    def ftp_connect(ftp, ip, port, user, pass_):
        try:
            ftp.connect(ip, port)
        except ConnectionRefusedError:
            ftp.close()
            return 2
        try:
            ftp.login(user, pass_)
        except ftplib.error_perm:
            ftp.close()
            return 1
        return 0

    def get_dir_list(self, ip, port, username, password):
        ftp = ftplib.FTP()

        result = self.ftp_connect(ftp, ip, port, username, password)
        dir_list = []

        if result == 0:
            for file in ftp.mlsd():
                if file[1]['type'] == 'dir':
                    dir_list.append(file[0])

        return dir_list

    def get_dirs(self, ip, port, username, password, path):
        ftp = ftplib.FTP()
        result = self.ftp_connect(ftp, ip, port, username, password)

        dir_list = []

        if result == 0:
            for file in ftp.mlsd(path):
                if file[1]['type'] == 'dir':
                    dir_list.append(file[0])

        return dir_list

    @staticmethod
    def get_ftp_connection():
        config = handler.configHelper.get_config()

        ftp = ftplib.FTP()
        ftp.connect(config[pS.FTP][pS.FTP_IP], int(config[pS.FTP][pS.PORT]))
        ftp.login(user=config[pS.FTP][pS.USERNAME], passwd=config[pS.FTP][pS.PASSWORD])
        return ftp
