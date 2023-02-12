from django.http import HttpResponse
from django.template import loader
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def react(request, page=None):
    template = loader.get_template('AndroidFTPBackup/index.html')

    return HttpResponse(template.render({}, request))
