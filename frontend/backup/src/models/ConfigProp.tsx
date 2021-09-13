class ConfigProp {
    value: string | number
    valid: boolean | undefined

    constructor(value: string = '', valid: boolean | undefined = undefined) {
        this.value = value
        this.valid = valid
    }
}

export default ConfigProp;