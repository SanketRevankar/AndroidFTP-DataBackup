import FileService from "src/service/FileService"

export const getReadableSize = (size?: number) => {
    if (!size) return '0'
    let n = 0
    while (size / 1024 > 1) {
        n += 1
        size /= 1024
    }

    return Math.round(size * 100) / 100 + " " + ['B', 'KB', 'MB', 'GB'][n]
}

export const handleFileOpen = (event: React.SyntheticEvent, query: string) => {
    FileService().openFile(query)
    event.stopPropagation()
}

export const joinPath = (path: string, name: string) => {
    return `${path}/${name}`
}
