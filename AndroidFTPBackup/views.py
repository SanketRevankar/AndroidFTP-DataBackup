from django.http import HttpResponse
from django.template import loader
from django.views.decorators.csrf import ensure_csrf_cookie

from AndroidFTPBackup import service


def api(request, func=''):
    func_map = {
        'dashboard-data': service.dashboard_data,
        'open_': service.open_file,
        'save_config': service.save_config,
        'set_config': service.set_config,
        'get_config': service.get_config,
        'start_backup': service.start_backup,
        'cancel_backup': service.cancel_backup,
        'ftp_data': service.ftp_data,
        'test_connections': service.test_wifi_connection,
        'get_dirs': service.get_dirs,
        'get_connections': service.get_wifi_connections,
    }

    return func_map[func](request)


@ensure_csrf_cookie
def react(request, page=None):
    template = loader.get_template('AndroidFTPBackup/index.html')

    return HttpResponse(template.render({}, request))
