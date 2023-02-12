export default interface BackupData {
    size: number
    dirs: BackupDirData
    files: BackupFileData
}

export interface BackupFileData {
    [fileName: string]: number
}

export interface BackupDirData {
    [dirName: string]: BackupData
}