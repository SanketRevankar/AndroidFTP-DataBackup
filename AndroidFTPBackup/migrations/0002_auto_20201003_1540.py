# Generated by Django 2.2.5 on 2020-10-03 10:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('AndroidFTPBackup', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lastbackup',
            name='id',
            field=models.TextField(primary_key=True, serialize=False, verbose_name='Date last updated'),
        ),
    ]
