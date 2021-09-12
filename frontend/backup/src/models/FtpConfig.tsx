import ConfigProp from "./ConfigProp"
import DeviceProp from "./DeviceProp"

class FtpConfig {
    selectDevice = new DeviceProp()
    ftpUser = new ConfigProp()
    ftpPass = new ConfigProp()
    ftpPort = new ConfigProp()
    ftpTested = false
    connections: any = []
}

export default FtpConfig;