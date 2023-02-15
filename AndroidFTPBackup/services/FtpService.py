import json

from AndroidFTPBackup.helpers.FtpHelper import FtpHelper
from AndroidFTPBackup.helpers.WiFiHelper import WiFiHelper


class FtpService:
    @classmethod
    def refresh_ip(cls, request):
        ftp_config = json.loads(request.body.decode())
        ip = WiFiHelper.get_ip_by_mac(ftp_config['ipRange'], ftp_config['mac'])

        return dict(ip=ip)

    @classmethod
    def test_ftp(cls, request):
        ftp_data = json.loads(request.body.decode("utf-8"))['ftpData']
        status_code = FtpHelper.test_ftp(ftp_data)

        return dict(status_code=status_code)

    @classmethod
    def load_dir_data(cls, request):
        ftp_data = json.loads(request.body.decode("utf-8"))['ftpData']
        dir_data = FtpHelper.load_dir_data(ftp_data)

        return dict(dirs=dir_data)
