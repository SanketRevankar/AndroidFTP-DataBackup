import ConfigProp from "./ConfigProp"

class DeviceProp extends ConfigProp {
    macId: string
    loading: boolean

    constructor(value: string = '', valid: boolean | undefined = undefined, macId: string = '', loading: boolean = false) {
        super(value, valid)
        this.macId = macId
        this.loading = loading
    }
}

export default DeviceProp;