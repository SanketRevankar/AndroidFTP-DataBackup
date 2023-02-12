import BackupConfig from "src/model/config/BackupConfig";
import { postRequest } from "src/utils/ServiceHelper";

export default function BackupConfigService() {

    const getBackups = async () => {
        const response = await fetch('/AndroidFTPBackup/api/config')
        return await response.json()
    }

    const getConfig = async (config: string) => {
        const response = await fetch(`/AndroidFTPBackup/api/config/${config}`)
        return await response.json()
    }

    const saveConfig = (configData: BackupConfig, controller: AbortController) => {
        return postRequest('/AndroidFTPBackup/api/config', configData, controller)
    }

    return {
        getBackups: getBackups,
        getConfig: getConfig,
        saveConfig: saveConfig,
    }
}