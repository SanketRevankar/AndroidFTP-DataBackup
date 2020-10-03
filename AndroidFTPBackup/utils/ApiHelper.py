import asyncio
import json
import logging
import threading

from django.http import HttpResponse, JsonResponse

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTP_Backup import handler


class ApiHelper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info(pS.LOG_INIT.format(__name__))
        self.processes = {}

    @staticmethod
    def open_(request):
        handler.fileHelper.open_(request.GET.get(pS.QUERY).strip('/'))
        return JsonResponse({})

    def load_dir_data(self, request):
        next_ = request.GET.get(pS.QUERY)
        response = {}
        config = handler.configHelper.get_config()

        if next_ != '':
            response['current_dir'] = '/'.join(str(next_).split('/')[:-1])

        path = config[pS.PATH][pS.BACKUP_FOLDER] + next_.strip('/')

        response['current_size'] = self.get_readable_size(path)

        response['current_dir'] = path
        response['folders'] = []
        response['files'] = []

        for folder in handler.fileHelper.dirs[path][pS.FOLDERS]:
            response['folders'].append([folder, self.get_readable_size(handler.fileHelper.folder_join(path, folder))])

        for file, size in zip(handler.fileHelper.dirs[path][pS.FILES],
                              handler.fileHelper.dirs[path][pS.SIZES]):
            total_size, size = handler.fileHelper.get_readable_size(size)
            response['files'].append([file, self.get_formatted_size(size, total_size)])

        return JsonResponse(response)

    def get_readable_size(self, path):
        try:
            total_size, size = handler.fileHelper.get_readable_size(
                handler.fileHelper.dirs[path][pS.TOTAL_SIZE])
            return self.get_formatted_size(size, total_size)
        except KeyError:
            return 'Loading...'

    @staticmethod
    def get_formatted_size(size, total_size):
        return "{} {}".format(total_size, size)

    @staticmethod
    def get_chart(_):
        list_count = handler.fileHelper.data_list_count
        list_space = handler.fileHelper.data_list_space

        count = list(map(lambda k: [k, list_count[k]], list_count))
        space = list(map(lambda k: [k, list_space[k]], list_space))

        return JsonResponse({'size_chart_data': space, 'count_chart_data': count})

    @staticmethod
    def get_total_size(_):
        config = handler.configHelper.get_config()

        total_size, size = handler.fileHelper.get_readable_size(
            handler.fileHelper.dirs[config[pS.PATH][pS.BACKUP_FOLDER]][pS.TOTAL_SIZE])
        return JsonResponse({'total_size': str(total_size) + " " + size})

    @staticmethod
    def get_wifi_connections(request):
        hosts = handler.wiFiHelper.get_wifi_connections(request)

        return JsonResponse({'hosts': list(hosts.values())})

    @staticmethod
    def test_wifi_connection(request):
        ftp_data = json.loads(request.body.decode("utf-8"))
        ip = ftp_data[pS.IP]
        user = ftp_data[pS.NAME]
        pass_ = ftp_data[pS.PASS]
        port = int(ftp_data[pS.PORT])

        return JsonResponse({'status_code': handler.ftpHelper.test_wifi_connection(ip, port, user, pass_)})

    @staticmethod
    def get_dir_list(request):
        ftp_data = json.loads(request.body.decode("utf-8"))
        ip = ftp_data[pS.IP]
        user = ftp_data[pS.NAME]
        pass_ = ftp_data[pS.PASS]
        port = int(ftp_data[pS.PORT])

        response = {'status_code': handler.ftpHelper.test_wifi_connection(ip, port, user, pass_)}

        if response['status_code'] == 0:
            response['dir_list'] = dict((x, {'all_in_one': False, 'split_by_year_month': False, 'checked': False})
                                        for x in handler.ftpHelper.get_dir_list(ip, port, user, pass_))

        return JsonResponse(response)

    @staticmethod
    def set_config(request):
        config_name = request.GET.get(pS.NAME)

        handler.configHelper.config = handler.configHelper.load_config(config_name)

        return JsonResponse({})

    @staticmethod
    def save_config(request):
        config_data = json.loads(request.body.decode("utf-8"))

        backup_name = config_data['backup_name']
        backup_location = config_data['backup_location']
        handler.fileHelper.check_create_backup_folder(backup_location)

        config = {
            pS.ID_CAPS: {pS.BACKUP_NAME: config_data['backup_name']},
            pS.NMAP: {pS.HOSTS: config_data['nmap_range']},
            pS.FTP: {
                pS.FTP_IP: config_data['ip'],
                pS.USERNAME: config_data['name'],
                pS.PASSWORD: config_data['pass'],
                pS.PORT: config_data['port'],
                pS.MAC: config_data['mac'],
            }
        }

        backup_items = config_data['dir_list']

        folders = []
        for item in backup_items:
            current_item = [
                item[0],
                handler.fileHelper.folder_join(backup_location, item[0]),
                True if item[1]['split_by_year_month'] else False,
                True if item[1]['all_in_one'] else False
            ]
            folders.append(current_item)

        config[pS.PATH] = {
            pS.FOLDERS: folders.__str__(),
            pS.BACKUP_FOLDER: backup_location.strip('/') + '/',
            pS.MONTHS: "{'1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', "
                       "'9': '09', '10': '10', '11': '11', '12': '12'} "
        }

        handler.configHelper.save_config(config, backup_name)

        return JsonResponse({'saved': True})

    @staticmethod
    def load_config(_):
        config_object = handler.configHelper
        config = config_object.get_config()
        default_loaded = config_object.default_loaded

        sections_dict = {}
        sections = config.sections()
        for section in sections:
            options = config.options(section)
            temp_dict = {}
            for option in options:
                if option == 'folders':
                    temp_dict[option] = eval(config.get(section, option))
                else:
                    temp_dict[option] = config.get(section, option)

            sections_dict[section] = temp_dict

        return JsonResponse({'config': sections_dict, 'default': default_loaded})

    @staticmethod
    def folder_list(_):
        return JsonResponse({'folders': handler.fileHelper.folder_list()})

    @staticmethod
    def ftp_data(_):
        config = handler.configHelper.get_config()

        config[pS.NMAP][pS.FTP_IP] = handler.wiFiHelper.get_ip_by_mac(
            config[pS.NMAP][pS.HOSTS], config[pS.FTP][pS.MAC])
        return JsonResponse({
            pS.NAME: config[pS.FTP][pS.USERNAME],
            pS.PASS: config[pS.FTP][pS.PASSWORD],
            pS.IP: config[pS.NMAP][pS.FTP_IP],
            pS.PORT: config[pS.FTP][pS.PORT],
        })

    @staticmethod
    def worker(loop, backup_name):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(handler.backupHelper.data_backup(backup_name))

    def start_backup(self, request):
        backup_name = request.GET.get('backup_name')

        from AndroidFTPBackup.models import LastBackup

        loop = asyncio.new_event_loop()
        self.processes[backup_name] = {'thread': threading.Thread(target=self.worker, args=(loop, backup_name,))}
        self.logger.info(pS.STARTING_BACKUP_THREAD)
        self.logger.info("Last Backup on: " + LastBackup.objects.get_or_create(id=backup_name, defaults={
            pS.PUB_NAME: pS.INIT_DATE})[0].pub_date)
        try:
            self.processes[backup_name]['thread'].start()
            self.processes[backup_name]['status'] = 'start'
        except RuntimeError:
            self.logger.exception(pS.EXCEPTION_IN_BACKUP)

        return HttpResponse(pS.INITIALIZING_BACKUP)

    def cancel_backup(self, request):
        backup_name = request.GET.get('backup_name')

        self.processes[backup_name]['status'] = 'stop'

        return HttpResponse(pS.INITIALIZING_BACKUP)
