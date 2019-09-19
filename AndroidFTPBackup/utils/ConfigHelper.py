import logging
from configparser import ConfigParser, ExtendedInterpolation

_conf = r'C:\Users\Sanketsr\PycharmProjects\AndroidFTP-DataBackup\AndroidFTPBackup\conf\main.conf'


class ConfigHelper:

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info('{} - Initiated'.format(__name__))
        self.config = ConfigParser(allow_no_value=True, inline_comment_prefixes=('#',),
                                   interpolation=ExtendedInterpolation())
        self.config.read(_conf)

    def save_config(self):
        self.logger.info('Saving config to file: {}'.format(_conf))
        with open(_conf, 'w') as configfile:
            self.config.write(configfile)

    def get_config(self):
        self.logger.info('Loaded config from file: {}'.format(_conf))
        return self.config
