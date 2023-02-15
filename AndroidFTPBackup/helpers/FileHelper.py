import asyncio
import logging
import os
import platform
import threading
from pathlib import Path

from AndroidFTPBackup.constants import BackupConstants


class FileHelper:
    logger = logging.getLogger(__name__)
    file_data = {}

    @classmethod
    def get_data(cls, location):
        if location in cls.file_data:
            return cls.file_data[location]
        cls.async_init(location)
        return dict(initiated=False)

    @classmethod
    def init_stats(cls):
        return dict(dirs={}, initiated=False, stats={**{t: dict(size=0, count=0) for t in BackupConstants.TYPES},
                                                     'Others': dict(size=0, count=0)})

    @classmethod
    def add_stats(cls, file_name, file_size, stats):
        type_ = file_name.split('.')[-1].lower()
        for file_type in BackupConstants.TYPES:
            if type_ in BackupConstants.TYPES[file_type]:
                stats[file_type]['size'] += file_size
                stats[file_type]['count'] += 1
                break
        else:
            stats['Others']['size'] += file_size
            stats['Others']['count'] += 1

    @classmethod
    def generate_tree(cls, folder_path, stats):
        data = dict(files={}, dirs={}, size=0)
        for file_name in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file_name)
            file_size = os.path.getsize(file_path)
            if os.path.isfile(file_path):
                data['files'][file_name] = file_size
                data['size'] += file_size
                cls.add_stats(file_name, file_size, stats)
            if os.path.isdir(file_path):
                tree = cls.generate_tree(file_path, stats)
                data['dirs'][file_name] = tree
                data['size'] += tree['size']
        return data

    @classmethod
    async def initiate_file_system(cls, location, override):
        if location in cls.file_data and not override:
            return

        cls.logger.info('Initiating file system data collection: {}'.format(location))
        cls.file_data[location] = cls.init_stats()
        cls.file_data[location]['dirs'] = cls.generate_tree(location, cls.file_data[location]['stats'])
        cls.file_data[location]['initiated'] = True
        cls.logger.info('Completed file system data collection: {}'.format(location))

    @classmethod
    def open_file(cls, open_path):
        cls.logger.info('Open File: {}'.format(open_path))
        if platform.system() == "Windows":
            os.startfile(open_path)
        elif platform.system() == "Darwin":
            os.subprocess.Popen(["open_", open_path])
        else:
            os.subprocess.Popen(["xdg-open_", open_path])

    @classmethod
    def create_folder(cls, folder_path):
        Path(folder_path).mkdir(parents=True, exist_ok=True)

    @classmethod
    def async_init(cls, location, override=False):
        loop = asyncio.new_event_loop()
        p = threading.Thread(target=cls.worker, args=(loop, location, override))
        p.start()

    @classmethod
    def worker(cls, loop, location, override):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(cls.initiate_file_system(location, override))
