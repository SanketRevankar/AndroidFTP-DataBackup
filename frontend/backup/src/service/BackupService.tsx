import { postRequest } from "src/utils/ServiceHelper"

export default function BackupService() {

    const startBackup = (backupName: string, currentIp: string) => {
        return postRequest('/AndroidFTPBackup/api/backup/start', { backupName: backupName, currentIp: currentIp })
    }

    const cancelBackup = (backupName: string) => {
        return postRequest('/AndroidFTPBackup/api/backup/cancel', { backupName: backupName })
    }

    return {
        startBackup: startBackup,
        cancelBackup: cancelBackup,
    }
}