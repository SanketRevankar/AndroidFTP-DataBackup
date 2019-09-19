from django.conf.urls import url
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    url(r'^ajax/open_/$', views.handler.htmlHelper.open_, name='open_'),
    url(r'^ajax/get-total-size/$', views.handler.htmlHelper.get_total_size, name='get_total_size'),
    url(r'^ajax/open_dir/$', views.handler.htmlHelper.open_dir, name='open_dir'),
    url(r'^ajax/get-chart/$', views.handler.htmlHelper.get_chart, name='get_chart'),
    url(r'^ajax/get_connections/$', views.handler.htmlHelper.get_wifi_connections, name='get_wifi_connections'),
    url(r'^ajax/test_connections/$', views.handler.htmlHelper.test_wifi_connection, name='test_wifi_connection'),
    url(r'^ajax/get_dir_list/$', views.handler.htmlHelper.get_dir_list, name='get_dir_list'),
    url(r'^ajax/save_config/$', views.handler.htmlHelper.save_config, name='save_config'),
    url(r'^ajax/folder_list/$', views.handler.htmlHelper.folder_list, name='folder_list'),
    url(r'^ajax/start_backup/$', views.handler.htmlHelper.start_backup, name='start_backup'),
    url(r'^ajax/ftp_data/$', views.handler.htmlHelper.ftp_data, name='ftp_data'),
    path('<str:page>', views.index, name='index'),
    path('', views.index, name='index'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
