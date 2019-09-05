from django.conf.urls import url
from django.urls import path

from AndroidFTPBackup.utils import file_utils
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    url(r'^ajax/open_/$', file_utils.open_, name='open_'),
    url(r'^ajax/open_dir/$', file_utils.open_dir, name='open_dir')
]
