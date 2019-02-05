from typing import List, Dict

# FTP Server's IP and port
IP: str = '192.168.0.100'
PORT: int = 2221

# FTP Credentials
USERNAME: str = 'USERNAME'
PASSWORD: str = 'PASSWORD'

# Base folder for storing backups
DESTINATION_FOLDER: str = 'C:/Backup/'

# File separator
CON: str = '/'

# File to save last update timestamp.
# Should be a valid filename.
# Separator should be "/"
UPDATE_DATE_TXT: str = 'C:/update_date.txt'


# List of Folders to backup
# Format: List[str]
# [<source folder path>, <destination folder path>, <Any String, Refer below comment for uses>]
#    3 Elements in list => Save backup to the folder mentioned
#    2 Elements in list => Save backup to the folder mentioned, create folders for Year/Month and save accordingly
# * Source path should not contain sdcard path, sdcard acts like the base folder by default.
FOLDERS: List[List[str]] = [
    ['WhatsApp/Media/WhatsApp Images', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Images'],
    ['WhatsApp/Media/WhatsApp Video', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Video'],
    ['WhatsApp/Media/WhatsApp Documents', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Documents'],
    ['WhatsApp/Media/WhatsApp Animated Gifs', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Animated Gifs'],
    ['DCIM/Camera', DESTINATION_FOLDER + 'Camera'],
    ['Pictures/Screenshots', DESTINATION_FOLDER + 'Pictures/Screenshots', ''],
]

# Source path for WhatsApp DB
MSGSTORE_DB_CRYPT_: str = 'WhatsApp/Databases/msgstore.db.crypt12'

# Destination  for WhatsApp DB
MSGSTORE_DB_CRYPT_DEST_: str = DESTINATION_FOLDER + 'Whatsapp/msgstore.db.crypt12'

# Format for month names.
# Folders will be created using values in this Dict
MONTHS: Dict[str, str] = {
    '1': '01-Jan',
    '2': '02-Feb',
    '3': '03-Mar',
    '4': '04-Apr',
    '5': '05-May',
    '6': '06-Jun',
    '7': '07-Jul',
    '8': '08-Aug',
    '9': '09-Sep',
    '10': '10-Oct',
    '11': '11-Nov',
    '12': '12-Dec',
}
