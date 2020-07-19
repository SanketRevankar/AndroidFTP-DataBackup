from AndroidFTPBackup.constants import HtmlStrings, PyStrings
from AndroidFTPBackup.utils.HtmlHelper import HtmlHelper

latest_backup = None
context = {
    'latest_backup': latest_backup,
}

config = None
fileHelper = None
htmlHelper = HtmlHelper()
wiFiHelper = None
ftpHelper = None
backupHelper = None
htmlStrings = HtmlStrings
pyStrings = PyStrings
