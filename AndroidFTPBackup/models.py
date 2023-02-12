from django.db import models


class Backup(models.Model):
    name = models.TextField('Backup name', primary_key=True)
    location = models.TextField('Backup Location')
    last_backup_start_time = models.TextField('Date last update started')
    last_backup_end_time = models.TextField('Date last update ended')
    config = models.TextField('Backup Config')
