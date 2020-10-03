from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.views.decorators.csrf import ensure_csrf_cookie

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTP_Backup import handler

defaultPage = 'dashboard'


def api(request, func=''):
    func_map = {
        'open_': handler.apiHelper.open_,
        'get-total-size': handler.apiHelper.get_total_size,
        'load_dir_data': handler.apiHelper.load_dir_data,
        'get-chart': handler.apiHelper.get_chart,
        'get_connections': handler.apiHelper.get_wifi_connections,
        'test_connections': handler.apiHelper.test_wifi_connection,
        'get_dir_list': handler.apiHelper.get_dir_list,
        'save_config': handler.apiHelper.save_config,
        'load_config': handler.apiHelper.load_config,
        'set_config': handler.apiHelper.set_config,
        'folder_list': handler.apiHelper.folder_list,
        'start_backup': handler.apiHelper.start_backup,
        'cancel_backup': handler.apiHelper.cancel_backup,
        'ftp_data': handler.apiHelper.ftp_data,
        'load_context': get_context
    }

    return func_map[func](request)


def get_context(_):
    config = handler.configHelper.get_config()
    context = {}
    if handler.configHelper.default_loaded:
        context['hosts'] = config['Nmap']['hosts']
        context['backup_config'] = True
        context['loadExisting'] = False
    elif 'backup_folder' in config['Path']:
        backup_name = config[pS.ID_CAPS][pS.BACKUP_NAME]
        context['latest_backup'] = 'Last Backup: {}'.format(handler.backupHelper.get_last_backup(backup_name)
                                                            .strftime(pS.DISPLAY_FORMAT))
        context['backup_name'] = backup_name
        context['backups'] = handler.configHelper.backups
        context[defaultPage] = True
        if defaultPage == 'backup_config':
            context['loadExisting'] = True
        context['backup_started'] = backup_name in handler.apiHelper.processes
        context['hosts'] = config['Nmap']['hosts']
    else:
        context['loadExisting'] = False
        context[defaultPage] = True
        context['hosts'] = config['Nmap']['hosts']
    return JsonResponse(context)


@ensure_csrf_cookie
def react(request, page=None):
    global defaultPage
    defaultPage = page if page is not None else defaultPage
    template = loader.get_template('AndroidFTPBackup/index.html')

    return HttpResponse(template.render({}, request))
