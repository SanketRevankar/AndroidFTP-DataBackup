import logging
import os
import platform

from AndroidFTPBackup.constants import PyStrings as pS
from AndroidFTP_Backup import handler


class FileHelper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info(pS.LOG_INIT.format(__name__))

        self.dirs = {}
        self.data_list_space = {pS.TYPE: pS.SIZE}
        self.data_list_count = {pS.TYPE: pS.COUNT}
        self.initiate_file_system()

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
    def initiate_file_system(self):
        self.logger.info(pS.SYSTEM_DATA_COLLECTION)
        data = {}

        for a, b, c in os.walk(handler.config[pS.PATH][pS.BACKUP_FOLDER]):
            replace_a = a.replace('\\', '/')
            self.dirs[replace_a] = {pS.FOLDERS: [x for x in b if x[0] != '$'], pS.FILES: c}

            sizes = []
            if c.__len__() != 0:
                for x in c:
                    type_ = x.split('.')[-1].lower()
                    if type_ in ['ini', 'tmp', 'dataulti', 'pic-store', 'crypt12', 'nomedia', 'vcs']:
                        continue
                    size = os.path.getsize(a + '\\' + x)
                    sizes.append(size)

                    for t in pS.types:
                        if type_ in pS.types[t]:
                            if t not in data:
                                data[t] = {
                                    pS.SIZE: size,
                                    pS.COUNT: 1
                                }
                                break
                            else:
                                data[t][pS.SIZE] += size
                                data[t][pS.COUNT] += 1
                                break
                    else:
                        if type_ not in data:
                            data[type_] = {
                                pS.SIZE: size,
                                pS.COUNT: 1
                            }
                        else:
                            data[type_][pS.SIZE] += size
                            data[type_][pS.COUNT] += 1

            self.dirs[replace_a][pS.SIZES] = sizes

        self.set_sizes(handler.config[pS.PATH][pS.BACKUP_FOLDER])

        for t in data:
            self.data_list_space[t] = round(data[t][pS.SIZE] / 1024 / 1024 / 1024, 3)
            self.data_list_count[t] = data[t][pS.COUNT]
            self.logger.info(pS.FILE_INFO.format(t, self.data_list_count[t], self.data_list_space[t]))

        return self.data_list_space, self.data_list_count

    @staticmethod
    def get_readable_size(size):
        n = 0
        while size / 1024 > 1:
            n += 1
            size /= 1024

        return round(size, 2), pS.sizes[n]

    def open_(self, path):
        self.logger.info(pS.OPEN_DIR.format(path))
        path = self.folder_join(handler.config[pS.PATH][pS.BACKUP_FOLDER], path)
        if platform.system() == pS.WINDOWS:
            os.startfile(path)
        elif platform.system() == pS.DARWIN:
            os.subprocess.Popen([pS.OPEN_, path])
        else:
            os.subprocess.Popen([pS.XDS_OPEN_, path])

    def check_create_backup_folder(self, path):
        if os.path.exists(path):
            return
        split_path = path.split('/')
        if split_path.__len__() == 2:
            os.mkdir('/'.join(split_path))
            return
        self.check_create_backup_folder('/'.join(split_path[:-1]))
        if split_path[-1] != '':
            self.logger.info(pS.CREATING_DIR.format(path))
            os.mkdir('/'.join(split_path))

    def folder_list(self):
        self.logger.info(pS.FETCHING_FOLDER_LIST)
        return eval(handler.config[pS.PATH][pS.FOLDERS])
