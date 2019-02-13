# AndroidFTP-DataBackup

**AndroidFTP-DataBackup** is used to backup up files from android phone to Laptop/ PC using a FTP Server hosted on the phone.

## Downloads required:
- [Python3](https://www.python.org/downloads/)
- [pywin32](https://pypi.org/project/pywin32/)
- Download **WiFi FTP Server** from Playstore to create a FTP Server on mobile phone.

## Configuration
**Make sure to update the configuration file before running the code.**

 - FTP Connection Details. Replace `192.168.0.100` with the IP of your FTP Server and `2221`
 with the port set for the server.
```
IP: str = '192.168.0.100'
PORT: int = 2221
```

- FTP Credentials. Insert your username and password set on the FTP server in place of
`USERNAME` and `PASSWORD`.
```
USERNAME: str = 'USERNAME'
PASSWORD: str = 'PASSWORD'
```

- Base folder for storing backups. All the files will be stored with reference to this folder.
Make sure you have sufficient space to save your data. Replace `C:/Backup/` with the path
you want to store your data. Path should end with `/`.
```
DESTINATION_FOLDER: str = 'C:/Backup/'
```

- File to save last update timestamp, this is used for updating from last backup state.
Should be a valid filename. Separator should be `/`. Replace `C:/update_date.txt` with any name
of your choice.
```
UPDATE_DATE_TXT: str = 'C:/update_date.txt'
```

- List of Folders to backup
    - Format: List[str]
    ```
     [<source folder path>, <destination folder path>, <Empty String, Refer below comment for uses>]
    ```
    - 3 Elements in list -> Save backup to the folder mentioned
    - 2 Elements in list -> Save backup to the folder mentioned, 
    create folders for Year/Month and save accordingly
    - Source path should not contain sdcard path, sdcard acts like the base folder by default.
    - Add paths you want to backup in similar way as given below.
```
FOLDERS: List[List[str]] = [
    ['WhatsApp/Media/WhatsApp Images', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Images'],
    ['WhatsApp/Media/WhatsApp Video', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Video'],
    ['WhatsApp/Media/WhatsApp Documents', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Documents'],
    ['WhatsApp/Media/WhatsApp Animated Gifs', DESTINATION_FOLDER + 'Whatsapp/WhatsApp Animated Gifs'],
    ['DCIM/Camera', DESTINATION_FOLDER + 'Camera'],
    ['Pictures/Screenshots', DESTINATION_FOLDER + 'Pictures/Screenshots', ''],
]
```

- Source path for WhatsApp DB. This will be the default path for WhatsApp Databases, change 
only if you are sure that you have some other path.
```
MSGSTORE_DB_CRYPT_: str = 'WhatsApp/Databases/msgstore.db.crypt12'
```

- Destination for WhatsApp DB. This will be the path to store the database backup, 
Replace `msgstore.db.crypt12` in case you want to store with some other name.
```
MSGSTORE_DB_CRYPT_DEST_: str = DESTINATION_FOLDER + 'Whatsapp/msgstore.db.crypt12'
```

- Format for month names, folders will be created using values in this Dictionary if set in 
config. You can change `01-Jan` of `'1': '01-Jan',` if you need any other folder name for
that month, do not change `1` of any other key in dictionary.
```
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
```

## How to take a Backup

- Run AndroidFTP-DataBackup
```
$ python3 ftpbackup.py
```