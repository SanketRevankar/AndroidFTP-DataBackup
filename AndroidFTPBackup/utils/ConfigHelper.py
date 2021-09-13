import logging
from configparser import ConfigParser, ExtendedInterpolation

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTP_Backup import handler

_conf = r'AndroidFTPBackup/conf/'


class ConfigHelper:

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info('{} - Initiated'.format(__name__))
        self.config = self.init_config_parser()
        self.config.read(_conf + 'main.conf')
        self.default_loaded = True
        self.logger.info('Loaded default config')
        self.backups = eval(self.config[pS.ID_CAPS][pS.BACKUPS])
        if len(self.backups) != 0:
            backup_name = self.config[pS.ID_CAPS][pS.DEFAULT_BACKUP]
            self.load_config(backup_name)
            self.default_loaded = False

    def load_config(self, backup_name, init=True):
        self.logger.info('Loaded config: ' + backup_name)
        config = self.init_config_parser()
        config.read(_conf + pS.BACKUPS_ + backup_name)
        self.config = config
        if init:
            handler.fileHelper.async_init()

    def save_config(self, config, backup_name):
        config_parser = self.init_config_parser()
        config_parser.read_dict(config)
        conf_backup_name = _conf + pS.BACKUPS_ + backup_name
        self.logger.info('Saving config to file: {}'.format(conf_backup_name))
        self.write_config(conf_backup_name, config_parser)

        main_config = self.init_config_parser()
        main_config.read(_conf + 'main.conf')
        backups = eval(main_config[pS.ID_CAPS][pS.BACKUPS])
        if backup_name not in backups:
            backups.append(backup_name)
        main_config[pS.ID_CAPS][pS.BACKUPS] = backups.__str__()

        if self.default_loaded:
            main_config[pS.ID_CAPS][pS.DEFAULT_BACKUP] = backup_name
            self.default_loaded = False
            self.backups = [backup_name]

        self.write_config(_conf + 'main.conf', main_config)
        self.load_config(backup_name)
        if backup_name not in self.backups:
            self.backups.append(backup_name)

    @staticmethod
    def write_config(conf_backup_name, config_parser):
        with open(conf_backup_name, 'w') as configfile:
            config_parser.write(configfile)

    @staticmethod
    def init_config_parser():
        return ConfigParser(allow_no_value=True, inline_comment_prefixes=('#',),
                            interpolation=ExtendedInterpolation())

    def get_config(self):
        return self.config
