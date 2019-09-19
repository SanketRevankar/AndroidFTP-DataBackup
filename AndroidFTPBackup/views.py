from django.http import HttpResponse
from django.template import loader

from AndroidFTPBackup.handler import Handler

handler = Handler()


def index(request, page=''):
    if page == 'backup':
        if 'backup_folder' not in handler.config['Path']:
            template = loader.get_template('AndroidFTPBackup/new_backup.html')
            context = handler.get_context()
            context['hosts'] = handler.configHelper.get_config()['Nmap']['hosts']
            return HttpResponse(template.render(context, request))
        else:
            template = loader.get_template('AndroidFTPBackup/backup.html')
            context = handler.get_context()
            return HttpResponse(template.render(context, request))

    template = loader.get_template('AndroidFTPBackup/dashboard.html')
    context = {}

    if 'backup_folder' not in handler.config['Path']:
        context['hosts'] = handler.configHelper.get_config()['Nmap']['hosts']
        template = loader.get_template('AndroidFTPBackup/new_backup.html')
    else:
        handler.fileHelper.initiate_file_system()
        context = handler.get_context()

    return HttpResponse(template.render(context, request))
