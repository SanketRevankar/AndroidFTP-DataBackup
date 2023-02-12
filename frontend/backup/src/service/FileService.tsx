import { postRequest } from "src/utils/ServiceHelper"

export default function FileService() {

    const openFile = (filePath: string) => {
        return postRequest('/AndroidFTPBackup/api/file/open', { filePath: filePath })
    }

    const getDashboardData = (backupLocation: string, controller: AbortController) => {
        return postRequest('/AndroidFTPBackup/api/file/data', { backupLocation: backupLocation }, controller)
    }

    return {
        openFile: openFile,
        getDashboardData: getDashboardData,
    }
}