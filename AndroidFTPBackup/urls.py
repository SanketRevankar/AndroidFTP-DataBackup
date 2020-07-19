from django.conf.urls import url
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from AndroidFTP_Backup import handler
from . import views

urlpatterns = [
    path(r'ajax/<str:func>/', views.ajax, name='ftp_data'),
    path('<str:page>', views.index, name='index'),
    path('', views.index, name='index'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
