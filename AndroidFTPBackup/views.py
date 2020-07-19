from django.http import HttpResponse
from django.template import loader

from AndroidFTP_Backup import handler


def index(request, page=''):
    if page == 'backup':
        if 'backup_folder' not in handler.config['Path']:
            template = loader.get_template('AndroidFTPBackup/new_backup.html')
            context = handler.context
            context['hosts'] = handler.config['Nmap']['hosts']
            return HttpResponse(template.render(context, request))
        else:
            template = loader.get_template('AndroidFTPBackup/backup.html')
            context = handler.context
            return HttpResponse(template.render(context, request))

    template = loader.get_template('AndroidFTPBackup/dashboard.html')
    context = {}

    if 'backup_folder' not in handler.config['Path']:
        context['hosts'] = handler.config['Nmap']['hosts']
        template = loader.get_template('AndroidFTPBackup/new_backup.html')
    else:
        # handler.fileHelper.initiate_file_system()
        context = handler.context

    return HttpResponse(template.render(context, request))


def ajax(request, func=''):
    func_map = {
        'open_': handler.htmlHelper.open_,
        'get-total-size': handler.htmlHelper.get_total_size,
        'open_dir': handler.htmlHelper.open_dir,
        'get-chart': handler.htmlHelper.get_chart,
        'get_connections': handler.htmlHelper.get_wifi_connections,
        'test_connections': handler.htmlHelper.test_wifi_connection,
        'get_dir_list': handler.htmlHelper.get_dir_list,
        'save_config': handler.htmlHelper.save_config,
        'folder_list': handler.htmlHelper.folder_list,
        'start_backup': handler.htmlHelper.start_backup,
        'ftp_data': handler.htmlHelper.ftp_data,
    }

    return func_map[func](request)