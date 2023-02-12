export default interface BackupStats {
    [fileType: string]: BackupStat
}

export interface BackupStat {
    size: number
    count: number
}