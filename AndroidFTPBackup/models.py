from django.db import models


class LastBackup (models.Model):
    pub_date = models.DateTimeField('Date last updated')

    def __str__(self):
        return 'Last Backup: ' + self.pub_date.strftime('%Y-%m-%d %H:%M:%S')
