import WebDirectoryConfig from "src/model/config/WebDirectoryConfig"

export const directoryConfigToSavedDir = (directoryConfig: WebDirectoryConfig) => {
    return Object.entries(directoryConfig.dirs)
        .filter(([_, dir]) => dir.selected)
        .map(([_, dir]) => ({
            path: dir.path,
            backupLocation: dir.backupLocation,
            recursive: dir.recursive,
            monthSeparated: dir.monthSeparated
        }))
}

