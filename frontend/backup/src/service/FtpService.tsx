import { postRequest } from "src/utils/ServiceHelper"

export default function FtpService() {

    const refreshIp = async (ipRange: string, mac: string, controller: AbortController) => {
        return postRequest('/AndroidFTPBackup/api/ftp/refreshIp', { ipRange: ipRange, mac: mac }, controller)
    }

    const testFtp = async (ftpData: object, controller: AbortController) => {
        return postRequest('/AndroidFTPBackup/api/ftp/test', { ftpData: ftpData }, controller)
    }

    const loadDirData = async (ftpData: object, controller: AbortController) => {
        return postRequest('/AndroidFTPBackup/api/ftp/loadDirData', { ftpData: ftpData }, controller)
    }

    return {
        refreshIp: refreshIp,
        testFtp: testFtp,
        loadDirData: loadDirData,
    }
}