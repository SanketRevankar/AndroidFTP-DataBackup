""" --------------------------------------------------------------------------------------------------------------------
                                                  STRINGS USED IN CODES
-------------------------------------------------------------------------------------------------------------------- """
""" --------------------------------------------------------------------------------------------------------------------
                                                 STRINGS USED FOR FTP
-------------------------------------------------------------------------------------------------------------------- """

PORT = 'port'
PASSWORD = 'password'
USERNAME = 'username'
FTP_IP = 'ftp_ip'
FTP = 'FTP'
PASS = 'pass'
NAME = 'name'
HOSTS = 'hosts'
NMAP = 'Nmap'
USER = 'user'

""" --------------------------------------------------------------------------------------------------------------------
                                                 STRINGS USED FOR FILE
-------------------------------------------------------------------------------------------------------------------- """

sizes = ['B', 'KB', 'MB', 'GB']
types = {
    'Images': ['dng', 'jpg', 'jpeg', 'png', 'bmp'],
    'Audio': ['aac', 'ogg', 'mp3', 'wav', 'amr', 'opus', 'm4a'],
    'Video': ['mp4', 'gif', '3gp', '3gpp', 'mkv', 'flv'],
    'Documents': ['xlsx', 'pdf', 'doc', 'docx', 'pptx', 'txt'],
    'Apps': ['apk'],
    'Compressed': ['zip', 'rar'],
}
OTHERS = 'Others'
WINDOWS = "Windows"
DARWIN = "Darwin"
XDS_OPEN_ = "xdg-open_"
OPEN_ = "open_"
BACKUP_FOLDER = 'backup_folder'
PATH = 'Path'
ID_CAPS = 'ID'
BACKUP_NAME = 'backup_name'
FOLDERS = 'folders'
FILES = 'files'
SIZES = 'sizes'
TOTAL_SIZE = 'total_size'
COUNT = 'Count'
SIZE = 'Size'
TYPE = 'Type'

""" --------------------------------------------------------------------------------------------------------------------
                                                STRINGS USED FOR LOGGING
-------------------------------------------------------------------------------------------------------------------- """

LOG_INIT = '{} - Initiated'
BACKUP_UPDATED_ON = 'Backup Updated on: {}'
CREATING_FOLDER = 'Creating Folder: {}'
FILE_CREATED_AT_TIME = 'Created file {} with time {}'
BACKING_UP_ = 'Backing up: {}'
FILE_ALREADY_EXISTS_ = 'File already exists: {}'
ERROR_SAVING_ = 'Error saving: {}.\n{}'
FILE_INFO = 'Data Type: {} - Count: {} Size: {}'
SYSTEM_DATA_COLLECTION = 'Initiating file system data collection'
OPEN_DIR = 'Open dir: {}'
CREATING_DIR = 'Creating dir: {}'
FETCHING_FOLDER_LIST = 'Fetching folder list'
LOG_SEPERATOR = '------------------------------------------------------------------------'
IP_WITH_MAC_NOT_FOUND = 'Wifi connection with MAC: {} on {} not found'
WIFI_WITH_MAC_HAS_IP_ = 'Wifi connection with MAC: {} has IP: {}'
GET_IP_FROM_MAC = 'Getting wifi connection with MAC: {} on {}'
VENDOR_ = 'Vendor: {}'
MAC_ID_ = 'Mac ID: {}'
FOUND_IP_ = 'Found IP: {}'
GET_WIFI_CONNECTIONS = 'Getting wifi connections on: {}'
INITIALIZING_BACKUP = 'Initiating Backup'
EXCEPTION_IN_BACKUP = 'Exception in Backup Thread'
STARTING_BACKUP_THREAD = 'Starting Backup Thread'


""" --------------------------------------------------------------------------------------------------------------------
                                                STRINGS USED FOR BACKUP
-------------------------------------------------------------------------------------------------------------------- """

ERROR_SAVING = 'Error saving: '
ADDED_TO = '\tAdded: {} to {}\n'
FOLDER_NUM_APPEND = '{}_{}{}'
ALREADY_EXISTS = '\tAlready Exists: '
INIT_DATE = '19800101000000.000'
PUB_NAME = 'pub_date'
TIME_FORMAT = '%Y%m%d%H%M%S.000'
DISPLAY_FORMAT = '%d %b %Y %I:%M:%S %p'
MODIFY = 'modify'
DIR = 'dir'
ANDROIDFTP_MESSAGE = 'AndroidFTPBackup.message'
BACKUP_COMPLETED_ON = 'Backup Completed on '
MESSAGE = 'message'
GROUP_NAME = 'output'
MONTHS = 'months'
RETR = "RETR "
TYPE_ = 'type'
BACKUPS_ = 'backups/'
DEFAULT_BACKUP = 'default_backup'
BACKUPS = 'backups'

NMAP_ARGS = '-sP --max-parallelism 200'
WRITE = 'w'
NOT_FOUND = 'Not Found'
TEMP_XML = 'xml-'
VENDOR = 'vendor'
MAC = 'mac'
ADDR = 'addr'
IP = 'ip'
IPV4 = 'ipv4'
ADDRTYPE = 'addrtype'
ADDRESS = 'address'
HOST = 'host'

""" --------------------------------------------------------------------------------------------------------------------
                                                STRINGS USED FOR HTML
-------------------------------------------------------------------------------------------------------------------- """

CONF_BACKUP_ITEMS = 'conf[backup_items]'
CONF_FTP_MAC = 'conf[ftp_mac]'
CONF_FTP_PORT = 'conf[ftp_port]'
CONF_FTP_USER = 'conf[ftp_user]'
CONF_FTP_PASS = 'conf[ftp_pass]'
CONF_FTP_IP = 'conf[ftp_ip]'
CONF_NMAP_RANGE = 'conf[nmap_range]'
CONF_BACKUP_LOCATION = 'conf[backup_location]'
CONF_BACKUP_NAME = 'conf[backup_name]'
SWITCH2 = '_switch2'
SWITCH1 = '_switch1'
ID = 'id'
DATA_SIZE = 'data_size'
DATA_COUNT = 'data_count'
QUERY = 'query'
