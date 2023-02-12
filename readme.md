# Android Data Backup using FTP

**AndroidFTP-DataBackup** is used to back up files from android phone to Laptop/ PC using an FTP Server hosted on the phone.

## Setup required:
- [Python3](https://www.python.org/downloads/)
- Download **Wi-Fi FTP Server** from Playstore to create an FTP Server on mobile phone.
## Optional:
- [Nmap](https://nmap.org/download.html) - Can be used to list devices from your network.
## Python modules:
- Install Python modules (from the base folder or provide path to requirements.txt)
    ```
    pip install -r requirements.txt
    ```

## Starting Django app
- Create a SQLite Database:
    ```
    python manage.py migrate AndroidFTPBackup
    ```
- Start the server:
    ```
    python manage.py runserver
    ```
- Open in the app in browser
    ```
    http://127.0.0.1:8000/AndroidFTPBackup
    ```
 