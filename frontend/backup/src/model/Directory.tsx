class Directory {
    path: string
    name?: string
    subDirectories?: string[]
    files?: string[]
    backupLocation: string
    selected?: boolean = false
    recursive: boolean = false
    monthSeparated: boolean = false
    total_size?: number
    sizes?: number[]

    constructor(path: string, name: string, backupLocation: string, monthSeparated: boolean = false, recursive: boolean = false, selected: boolean = false) {
        this.path = path
        this.name = name
        this.backupLocation = backupLocation
        this.monthSeparated = monthSeparated
        this.recursive = recursive
        this.selected = selected
    }
}

export default Directory;