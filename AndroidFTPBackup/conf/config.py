IP = '192.168.0.100'
PORT = 2221
USERNAME = 'Sanket'
PASSWORD = 'sanketsr'

BACKUP_FOLDER = r'D:/Sanketsr/Backup'
CON = '/'

DATA_BACKUP = True
WHATSAPP_DB_BACKUP = False
NMAP = True

HOSTS = '192.168.0.0/24'

FOLDERS = [
    ['WhatsApp/Media/WhatsApp Images', BACKUP_FOLDER + 'Whatsapp/WhatsApp Images'],
    ['WhatsApp/Media/WhatsApp Video', BACKUP_FOLDER + 'Whatsapp/WhatsApp Video'],
    ['WhatsApp/Media/WhatsApp Documents', BACKUP_FOLDER + 'Whatsapp/WhatsApp Documents'],
    ['WhatsApp/Media/WhatsApp Animated Gifs', BACKUP_FOLDER + 'Whatsapp/WhatsApp Animated Gifs'],
    ['DCIM/Camera', BACKUP_FOLDER + 'Camera'],
    ['Pictures/Screenshots', BACKUP_FOLDER + 'Pictures/Screenshots', ''],
    ['Pictures/Instagram', BACKUP_FOLDER + 'Pictures/Instagram', ''],
    ['Snapchat', BACKUP_FOLDER + 'Pictures/Snapchat'],
    ['Record/PhoneRecord', BACKUP_FOLDER + 'Record/PhoneRecord'],
    ['Record/SoundRecord', BACKUP_FOLDER + 'Record/SoundRecord', ''],
]
