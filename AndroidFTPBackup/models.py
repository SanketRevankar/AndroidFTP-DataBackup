from datetime import datetime

from django.db import models


class LastBackup(models.Model):
    pub_date = models.TextField('Date last updated')

    def __str__(self):
        return 'Last Backup: ' + datetime.strptime(self.pub_date, '%Y%m%d%H%M%S.%f').__str__()
