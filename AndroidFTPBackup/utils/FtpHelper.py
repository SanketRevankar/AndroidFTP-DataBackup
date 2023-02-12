import ftplib
import logging


class FtpHelper:
    logger = logging.getLogger(__name__)

    @classmethod
    def test_ftp(cls, ftp_data):
        try:
            ftp = cls.connect_ftp(ftp_data)
        except ConnectionRefusedError:
            return 2
        except ftplib.error_perm:
            return 1
        ftp.close()
        return 0

    @classmethod
    def load_dir_data(cls, ftp_data):
        ftp = cls.connect_ftp(ftp_data)

        dir_list = []
        for file in ftp.mlsd(ftp_data['path']):
            if file[1]['type'] == 'dir':
                dir_list.append(file[0])

        ftp.close()
        return dir_list

    @classmethod
    def connect_ftp(cls, ftp_data):
        ftp = ftplib.FTP()
        ftp.connect(ftp_data['ip'], int(ftp_data['port']))
        ftp.login(ftp_data['userId'], ftp_data['password'])
        return ftp
