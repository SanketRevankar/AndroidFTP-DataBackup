import { postRequest } from "src/utils/ServiceHelper"

export default function WiFiService() {

    const getConnectedDevices = async (ipRange: string, controller: AbortController) => {
        return postRequest('/AndroidFTPBackup/api/wifi', { ipRange: ipRange }, controller)
    }

    return {
        getConnectedDevices: getConnectedDevices,
    }
}