import asyncio
import json
import logging
import threading

from django.http import HttpResponse, JsonResponse

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTPBackup.utils import BackupHelper
from AndroidFTPBackup.utils.FtpHelper import FtpHelper
from AndroidFTPBackup.utils.WiFiHelper import WiFiHelper
from AndroidFTP_Backup import handler


class BackupService:
    logger = logging.getLogger(__name__)
    logger.info(pS.LOG_INIT.format(__name__))
    processes = {}


def open_file(request):
    handler.fileHelper.open_file(request.GET.get(pS.QUERY).strip('/'))
    return JsonResponse({})


def dashboard_data(_):
    config = handler.configHelper.get_config()

    list_count = handler.fileHelper.data_list_count
    list_space = handler.fileHelper.data_list_space

    count = list(map(lambda k: [k, list_count[k]], list_count))
    space = list(map(lambda k: [k, list_space[k]], list_space))

    try:
        total_size, size = handler.fileHelper.get_readable_size(
            handler.fileHelper.dirs[config[pS.PATH][pS.BACKUP_FOLDER]][pS.TOTAL_SIZE])
        initiated = True
    except KeyError:
        total_size, size = 'Loading', 'Data'
        initiated = False

    return JsonResponse({
        'dirs': handler.fileHelper.dirs,
        'base_dir': config[pS.PATH][pS.BACKUP_FOLDER],
        'size_chart_data': space,
        'count_chart_data': count,
        'initiated': initiated,
        'total_size': str(total_size) + " " + size
    })


def get_readable_size(path):
    try:
        total_size, size = handler.fileHelper.get_readable_size(
            handler.fileHelper.dirs[path][pS.TOTAL_SIZE])
        return get_formatted_size(size, total_size)
    except KeyError:
        return 'Loading...'


def get_formatted_size(size, total_size):
    return "{} {}".format(total_size, size)


def get_wifi_connections(request):
    hosts = WiFiHelper().get_wifi_connections(request)

    return JsonResponse({'hosts': list(hosts.values())})


def test_wifi_connection(request):
    data = json.loads(request.body.decode("utf-8"))
    ip = data[pS.IP]
    user = data[pS.NAME]
    pass_ = data[pS.PASS]
    port = int(data[pS.PORT])

    return JsonResponse({'status_code': FtpHelper().test_wifi_connection(ip, port, user, pass_)})


def get_dirs(request):
    data = json.loads(request.body.decode("utf-8"))
    ip = data[pS.IP]
    user = data[pS.NAME]
    pass_ = data[pS.PASS]
    port = int(data[pS.PORT])
    path = data[pS.FTP_PATH]

    return JsonResponse({'dirs': FtpHelper().get_dirs(ip, port, user, pass_, path)})


def set_config(request):
    config_name = request.GET.get(pS.NAME)
    handler.configHelper.load_config(config_name)

    return JsonResponse({})


def save_config(request):
    config_data = json.loads(request.body.decode("utf-8"))

    backup_name = config_data['basicConfig']['backupName']['value']
    backup_location = config_data['basicConfig']['backupLocation']['value']
    handler.fileHelper.check_create_backup_folder(backup_location)

    config = {
        pS.ID_CAPS: {pS.BACKUP_NAME: backup_name},
        pS.NMAP: {pS.HOSTS: config_data['basicConfig']['nmapRange']['value']},
        pS.FTP: {
            pS.FTP_IP: config_data['ftpConfig']['selectDevice']['value'],
            pS.USERNAME: config_data['ftpConfig']['ftpUser']['value'],
            pS.PASSWORD: config_data['ftpConfig']['ftpPass']['value'],
            pS.PORT: config_data['ftpConfig']['ftpPort']['value'],
            pS.MAC: config_data['ftpConfig']['selectDevice']['macId'],
        }
    }

    backup_items = config_data['directoryConfig']['dirs']

    folders = []
    for item in backup_items:
        if backup_items[item]['selected']:
            current_item = [
                backup_items[item]['path'],
                backup_items[item]['backupLocation'],
                backup_items[item]['monthSeparated'],
                backup_items[item]['recursive'],
            ]
            folders.append(current_item)

    config[pS.PATH] = {
        pS.FOLDERS: folders.__str__(),
        pS.BACKUP_FOLDER: backup_location.strip('/'),
        pS.MONTHS: "{'1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', "
                   "'9': '09', '10': '10', '11': '11', '12': '12'} "
    }

    handler.configHelper.save_config(config, backup_name)

    return JsonResponse({'saved': True})


def get_config(_):
    config = handler.configHelper.get_config()

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

    if len(handler.configHelper.backups) == 0:
        return JsonResponse({'backups': handler.configHelper.backups})
    else:
        backup_name = config[pS.ID_CAPS][pS.BACKUP_NAME]
        if handler.configHelper.default_loaded:
            backups = []
            latest_backup = None
        else:
            backups = handler.configHelper.backups
            latest_backup = BackupHelper.BackupHelper.get_last_backup(backup_name).strftime(pS.DISPLAY_FORMAT)

        return JsonResponse({'config': sections_dict,
                             'backups': backups,
                             'latest_backup': latest_backup,
                             'backup_started': backup_name in BackupService.processes
                             })


def ftp_data(_):
    config = handler.configHelper.get_config()

    config[pS.NMAP][pS.FTP_IP] = WiFiHelper().get_ip_by_mac(
        config[pS.NMAP][pS.HOSTS], config[pS.FTP][pS.MAC])
    return JsonResponse({
        pS.NAME: config[pS.FTP][pS.USERNAME],
        pS.PASS: config[pS.FTP][pS.PASSWORD],
        pS.IP: config[pS.NMAP][pS.FTP_IP],
        pS.PORT: config[pS.FTP][pS.PORT],
    })


def worker(loop, backup_name):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(BackupHelper.BackupHelper().data_backup(backup_name))


def start_backup(request):
    backup_name = request.GET.get('backup_name')

    from AndroidFTPBackup.models import LastBackup

    loop = asyncio.new_event_loop()
    BackupService.processes[backup_name] = {'thread': threading.Thread(target=worker, args=(loop, backup_name,))}
    BackupService.logger.info(pS.STARTING_BACKUP_THREAD)
    BackupService.logger.info("Last Backup on: " + LastBackup.objects.get_or_create(id=backup_name, defaults={
        pS.PUB_NAME: pS.INIT_DATE})[0].pub_date)
    try:
        BackupService.processes[backup_name]['thread'].start()
        BackupService.processes[backup_name]['status'] = 'start'
    except RuntimeError:
        BackupService.logger.exception(pS.EXCEPTION_IN_BACKUP)

    return HttpResponse(pS.INITIALIZING_BACKUP)


def cancel_backup(request):
    backup_name = request.GET.get('backup_name')
    BackupService.processes[backup_name]['status'] = 'stop'

    return HttpResponse(pS.INITIALIZING_BACKUP)
