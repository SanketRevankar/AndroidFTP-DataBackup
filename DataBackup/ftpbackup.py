import ftplib

from DataBackup import backup_util, config


class FtpBackup:
    def __init__(self):
        self.date = backup_util.get_date_of_last_backup()
        self.ftp = ftplib.FTP()
        try:
            self.ftp.connect(backup_util.confirm_ip(), config.PORT)
        except TimeoutError:
            backup_util.connection_failed()
        try:
            self.ftp.login(config.USERNAME, config.PASSWORD)
        except ftplib.error_perm:
            backup_util.auth_failed()

    def backup(self):
        backup_util.data_backup(self.date, self.ftp)
        backup_util.whatsapp_db_backup(self.ftp)
        backup_util.save_date_of_current_backup()


if __name__ == '__main__':
    FtpBackup().backup()
