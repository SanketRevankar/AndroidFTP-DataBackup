from django.db import models


class LastBackup(models.Model):
    id = models.TextField('Date last updated', primary_key=True)
    pub_date = models.TextField('Date last updated')
