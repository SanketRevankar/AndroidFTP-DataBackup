# AndroidFTP-DataBackup [Django Framework]

**AndroidFTP-DataBackup** is used to backup up files from android phone to Laptop/ PC using a FTP Server hosted on the phone.

## Downloads required:
- [Python3](https://www.python.org/downloads/)
- Download **WiFi FTP Server** from Playstore to create a FTP Server on mobile phone.

## Python modules:
- Install Django
    ```
    pip install django
    ```
- Install channels
    ```
    pip install channels
    ```
- Install Nmap extension for Python
    ```
    pip install python-nmap
    ```
- Install Dateutil
    ```
    pip install python-dateutil
    ```
- Install win32 libraries
    ```
    pip install pywin32
    ```

## Starting Django app
- Create a SQLite Database:
    ```
    python manage.py migrate AndroidFTPBackup
    ```
- Open AndroidFTPBackup/handler.py and uncomment these lines:
    ```
    try:
        self.latest_backup = LastBackup.objects.get(id=1)
    except LastBackup.DoesNotExist:
        pass
    ```
- Start the server:
    ```
    python manage.py runserver
    ```
- Open in the app in browser
    ```
    http://127.0.0.1:8000/AndroidFTPBackup
    ```
 