from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

urlpatterns = [
    path(r'api/<str:func>', views.api, name='ftp_data'),
    path('<str:page>', views.react, name='react'),
    path('config/<str:page>', views.react, name='react'),
    path('', views.react, name='index'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
