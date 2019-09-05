import os

from django.shortcuts import render, redirect

# Create your views here.
from django.http import HttpResponse
from django.template import loader

from AndroidFTPBackup.conf.config import BACKUP_FOLDER
from AndroidFTPBackup.models import LastBackup
from AndroidFTPBackup.utils.file_utils import get_file_count, get_file_sizes, open_


def index(request):
    # if request.GET.get('open_'):
    #     open_()
    #     return redirect(request.META['HTTP_REFERER'])

    latest_backup = LastBackup.objects.get(id=1)
    template = loader.get_template('AndroidFTPBackup/index.html')
    files = get_file_count()
    sizes, counts, total_size = get_file_sizes(BACKUP_FOLDER)
    context = {
        'latest_backup': latest_backup,
        'files': files,
        'sizes': sizes,
        'backup_location': BACKUP_FOLDER,
        'total_size': total_size,
        'counts': counts,
    }

    return HttpResponse(template.render(context, request))
