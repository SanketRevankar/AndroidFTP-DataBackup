import asyncio
import logging
import threading

from django.http import HttpResponse, JsonResponse

from AndroidFTPBackup.constants import HtmlStrings as Hs, PyStrings as pS
from AndroidFTP_Backup import handler


class HtmlHelper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info(pS.LOG_INIT.format(__name__))

    @staticmethod
    def open_(request):
        handler.fileHelper.open_(request.GET.get(pS.QUERY))
        return JsonResponse({})

    @staticmethod
    def open_dir(request):
        response = Hs.HEADER_

        next_ = request.GET.get(pS.QUERY)
        if next_ != '':
            response += Hs.CURRENT_DIR + '/'.join(str(next_).split('/')[:-1]) + Hs.END_A

        path = handler.config[pS.PATH][pS.BACKUP_FOLDER] + next_.strip('/')
        n = 0

        total_size, size = handler.fileHelper.get_readable_size(
            handler.fileHelper.dirs[path][pS.TOTAL_SIZE])
        response += path + Hs.SIZE_SPAN.format(total_size, size) + Hs.END_LI
        response += Hs.LIST_CONTAINER

        for folder in handler.fileHelper.dirs[path][pS.FOLDERS]:
            n += 1
            total_size, size = handler.fileHelper.get_readable_size(
                handler.fileHelper.dirs[handler.fileHelper.folder_join(path, folder)][pS.TOTAL_SIZE])
            response += Hs.DARK_LIST_FOLDER.format(next_, folder, folder, total_size, size) if n % 2 == 0 else \
                Hs.NORMAL_LIST_FOLDER.format(next_, folder, folder, total_size, size)

        for file, size in zip(handler.fileHelper.dirs[path][pS.FILES],
                              handler.fileHelper.dirs[path][pS.SIZES]):
            n += 1
            a, b = handler.fileHelper.get_readable_size(size)
            response += Hs.DARK_LIST_FILE.format(next_, file, file, a, b) if n % 2 == 0 else \
                Hs.NORMAL_LIST_FILE.format(next_, file, file, a, b)

        response += Hs.END_DIV
        response += Hs.ONCLICK_AJAX_SCRIPT

        return HttpResponse(response)

    @staticmethod
    def get_chart(request):
        id_ = request.GET.get(pS.ID)
        if id_ == pS.DATA_COUNT:
            return JsonResponse(handler.fileHelper.data_list_count)
        if id_ == pS.DATA_SIZE:
            return JsonResponse(handler.fileHelper.data_list_space)

    @staticmethod
    def get_total_size(_):
        total_size, size = handler.fileHelper.get_readable_size(
            handler.fileHelper.dirs[handler.config[pS.PATH][pS.BACKUP_FOLDER]][pS.TOTAL_SIZE])
        return HttpResponse(str(total_size) + " " + size)

    @staticmethod
    def get_wifi_connections(request):
        hosts = handler.wiFiHelper.get_wifi_connections(request)

        response = Hs.CHOOSE_DEVICE
        for host in hosts:
            if pS.VENDOR in hosts[host] and pS.MAC in hosts[host]:
                response += Hs.OPTION_IP_MAC_VENDOR.format(host, hosts[host][pS.MAC], hosts[host][pS.IP],
                                                           hosts[host][pS.VENDOR])
            else:
                if pS.MAC not in hosts[host]:
                    continue
                response += Hs.OPTION_IP_MAC.format(host, hosts[host][pS.MAC], hosts[host][pS.IP])

        return HttpResponse(response)

    @staticmethod
    def test_wifi_connection(request):
        ip = request.GET.get(pS.IP)
        user = request.GET.get(pS.USER)
        pass_ = request.GET.get(pS.PASS)
        port = int(request.GET.get(pS.PORT))

        return HttpResponse(handler.ftpHelper.test_wifi_connection(ip, port, user, pass_))

    @staticmethod
    def get_dir_list(request):
        dir_list = handler.ftpHelper.get_dir_list(request.GET.get(pS.IP), int(request.GET.get(pS.PORT)),
                                                  request.GET.get(pS.USER), request.GET.get(pS.PASS))
        response = ''

        n = 3
        for i in range(0, dir_list.__len__(), n):
            response += Hs.DIV_FORM_ROW_
            for dir_ in dir_list[i:i + n]:
                response += Hs.DIR_LIST.format(dir_, dir_, dir_, dir_, dir_, dir_, dir_)
            response += Hs.END_DIV

        response += Hs.DIR_NEXT_LIST

        return HttpResponse(response)

    @staticmethod
    def save_config(request):
        config = handler.config
        config[pS.PATH][pS.BACKUP_FOLDER] = request.GET.get(pS.CONF_BACKUP_LOCATION)
        handler.fileHelper.check_create_backup_folder(config[pS.PATH][pS.BACKUP_FOLDER])
        config[pS.NMAP][pS.HOSTS] = request.GET.get(pS.CONF_NMAP_RANGE)
        config[pS.FTP][pS.FTP_IP] = request.GET.get(pS.CONF_FTP_IP)
        config[pS.FTP][pS.USERNAME] = request.GET.get(pS.CONF_FTP_USER)
        config[pS.FTP][pS.PASSWORD] = request.GET.get(pS.CONF_FTP_PASS)
        config[pS.FTP][pS.PORT] = request.GET.get(pS.CONF_FTP_PORT)
        config[pS.FTP][pS.MAC] = request.GET.get(pS.CONF_FTP_MAC)

        backup_items = request.GET.get(pS.CONF_BACKUP_ITEMS).split(',')

        folders = []
        for item in backup_items:
            if pS.SWITCH1 in item or pS.SWITCH2 in item:
                continue
            current_item = [item, handler.fileHelper.folder_join(config[pS.PATH][pS.BACKUP_FOLDER], item),
                            True if item + pS.SWITCH1 in backup_items else False,
                            True if item + pS.SWITCH2 in backup_items else False]
            folders.append(current_item)
        config[pS.PATH][pS.FOLDERS] = folders.__str__()

        handler.configHelper.save_config()

        return HttpResponse('')

    @staticmethod
    def folder_list(_):
        folders = handler.fileHelper.folder_list()
        response = Hs.DIV_LIST_FLUSH
        for folder in folders:
            if folder[3] and folder[2]:
                response += Hs.DIV_LIST_BOTH.format(folder[0])
            elif folder[2]:
                response += Hs.DIV_LIST_ONE.format(folder[0])
            elif folder[3]:
                response += Hs.DIV_LIST_TWO.format(folder[0])
        response += Hs.END_DIV

        return HttpResponse(response)

    @staticmethod
    def ftp_data(_):
        handler.config[pS.NMAP][pS.FTP_IP] = handler.wiFiHelper.get_ip_by_mac(
            handler.config[pS.NMAP][pS.HOSTS], handler.config[pS.FTP][pS.MAC])
        return JsonResponse({
            pS.NAME: handler.config[pS.FTP][pS.USERNAME],
            pS.PASS: handler.config[pS.FTP][pS.PASSWORD],
            pS.IP: handler.config[pS.NMAP][pS.FTP_IP],
            pS.PORT: handler.config[pS.FTP][pS.PORT],
        })

    @staticmethod
    def worker(loop):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(handler.backupHelper.data_backup())

    def start_backup(self, _):
        from AndroidFTPBackup.models import LastBackup

        loop = asyncio.new_event_loop()
        p = threading.Thread(target=self.worker, args=(loop,))
        self.logger.info(pS.STARTING_BACKUP_THREAD)
        self.logger.info("Last Backup on: " + LastBackup.objects.get_or_create(id=1, defaults={
            pS.PUB_NAME: pS.INIT_DATE})[0].pub_date)
        try:
            p.start()
        except:
            self.logger.exception(pS.EXCEPTION_IN_BACKUP)

        return HttpResponse(pS.INITIALIZING_BACKUP)
