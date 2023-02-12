from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views
from .apis.BackupApi import BackupApi
from .apis.ConfigApi import ConfigApi
from .apis.FileApi import FileApi
from .apis.FtpApi import FtpApi
from .apis.WiFiApi import WiFiApi

urlpatterns = [
    path(r'api/config', ConfigApi.handle, name='config'),
    path(r'api/config/<str:name>', ConfigApi.handle, name='get_config'),
    path(r'api/wifi', WiFiApi.handle, name='wifi'),
    path(r'api/file/<str:operation>', FileApi.handle, name='file_service'),
    path(r'api/ftp/<str:operation>', FtpApi.handle, name='ftp_service'),
    path(r'api/backup/<str:operation>', BackupApi.handle, name='backup_service'),
    path('<str:page>', views.react, name='react'),
    path('config/<str:page>', views.react, name='react'),
    path('', views.react, name='index'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
