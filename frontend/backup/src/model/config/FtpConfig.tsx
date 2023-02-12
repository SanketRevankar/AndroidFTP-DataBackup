import DeviceData from "../DeviceData"

export default class FtpConfig {
    device: DeviceData
    userId: string
    password: string
    port: string

    constructor() {
        this.device = new DeviceData()
        this.userId = ''
        this.password = ''
        this.port = ''
    }
}
 