import ConfigProp from "./ConfigProp"

class BasicConfig {
    backupName: ConfigProp = new ConfigProp()
    backupLocation: ConfigProp = new ConfigProp()
    nmapRange: ConfigProp = new ConfigProp('192.168.0.0/24', true)
}

export default BasicConfig;