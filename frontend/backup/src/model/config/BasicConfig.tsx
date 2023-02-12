export default class BasicConfig {
    name: string
    location: string
    nmapRange: string
    useNmap: boolean

    constructor() {
        this.name = ''
        this.location = ''
        this.nmapRange = '192.168.0.0/16'
        this.useNmap = true
    }
}
