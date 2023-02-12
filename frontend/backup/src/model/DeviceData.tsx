export default class DeviceData {
    mac: string
    ip: string
    vendor?: string

    constructor() {
        this.ip = ''
        this.mac = ''
    }
}