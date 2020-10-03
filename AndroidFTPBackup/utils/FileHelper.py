import asyncio
import logging
import os
import platform
import threading
from os import path, mkdir

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTP_Backup import handler


class FileHelper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info(pS.LOG_INIT.format(__name__))

        self.dirs = {}
        self.data_list_space = {pS.TYPE: pS.SIZE}
        self.data_list_count = {pS.TYPE: pS.COUNT}

    def set_sizes(self, folder):
        self.dirs[folder][pS.TOTAL_SIZE] = sum(self.dirs[folder][pS.SIZES]) \
            if self.dirs[folder][pS.FILES].__len__() > 0 else 0
        for cur_folder in self.dirs[folder][pS.FOLDERS]:
            self.set_sizes(self.folder_join(folder, cur_folder))
            self.dirs[folder][pS.TOTAL_SIZE] += self.dirs[self.folder_join(folder, cur_folder)][pS.TOTAL_SIZE]

    @staticmethod
    def folder_join(folder, cur_folder):
        return folder + ('/' if folder[-1] != '/' else '') + cur_folder

    # noinspection PyTypeChecker
    async def initiate_file_system(self):
        config = handler.configHelper.get_config()

        if pS.BACKUP_FOLDER not in config[pS.PATH]:
            return

        self.logger.info(pS.SYSTEM_DATA_COLLECTION)
        data = {pS.OTHERS: {pS.SIZE: 0, pS.COUNT: 0}}
        for t in pS.types:
            data[t] = {pS.SIZE: 0, pS.COUNT: 0}

        for a, b, c in os.walk(config[pS.PATH][pS.BACKUP_FOLDER]):
            replace_a = a.replace('\\', '/')
            self.dirs[replace_a] = {pS.FOLDERS: [x for x in b if x[0] != '$'], pS.FILES: c}

            sizes = []
            if c.__len__() != 0:
                for x in c:
                    type_ = x.split('.')[-1].lower()
                    size = os.path.getsize(a + '\\' + x)
                    sizes.append(size)

                    for t in pS.types:
                        if type_ in pS.types[t]:
                            data[t][pS.SIZE] += size
                            data[t][pS.COUNT] += 1
                            break
                    else:
                        data[pS.OTHERS][pS.SIZE] += size
                        data[pS.OTHERS][pS.COUNT] += 1

            self.dirs[replace_a][pS.SIZES] = sizes

        self.set_sizes(config[pS.PATH][pS.BACKUP_FOLDER])

        for t in data:
            self.data_list_space[t] = round(data[t][pS.SIZE] / 1024 / 1024 / 1024, 3)
            self.data_list_count[t] = data[t][pS.COUNT]
            self.logger.info(pS.FILE_INFO.format(t, self.data_list_count[t],
                                                 ' '.join(map(str, self.get_readable_size(data[t][pS.SIZE])))))

        return self.data_list_space, self.data_list_count

    @staticmethod
    def get_readable_size(size):
        n = 0
        while size / 1024 > 1:
            n += 1
            size /= 1024

        return round(size, 2), pS.sizes[n]

    def open_(self, open_path):
        config = handler.configHelper.get_config()

        self.logger.info(pS.OPEN_DIR.format(open_path))
        open_path = self.folder_join(config[pS.PATH][pS.BACKUP_FOLDER], open_path)
        if platform.system() == pS.WINDOWS:
            os.startfile(open_path)
        elif platform.system() == pS.DARWIN:
            os.subprocess.Popen([pS.OPEN_, open_path])
        else:
            os.subprocess.Popen([pS.XDS_OPEN_, open_path])

    def check_create_backup_folder(self, folder_path):
        if os.path.exists(folder_path):
            return
        split_path = folder_path.split('/')
        if split_path.__len__() == 2:
            os.mkdir('/'.join(split_path))
            return
        self.check_create_backup_folder('/'.join(split_path[:-1]))
        if split_path[-1] != '':
            self.logger.info(pS.CREATING_DIR.format(folder_path))
            os.mkdir('/'.join(split_path))

    def folder_list(self):
        config = handler.configHelper.get_config()

        self.logger.info(pS.FETCHING_FOLDER_LIST)
        return eval(config[pS.PATH][pS.FOLDERS])

    @staticmethod
    def create_folder_if_not_exists(logger, folder):
        if not path.exists(folder):
            logger.info(pS.CREATING_FOLDER.format(folder))
            mkdir(folder)

    def async_init(self):
        loop = asyncio.new_event_loop()
        p = threading.Thread(target=self.worker, args=(loop,))
        p.start()

    def worker(self, loop):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.initiate_file_system())
