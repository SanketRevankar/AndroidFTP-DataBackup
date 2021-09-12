interface BackupData {
    selectedConfig?: string | number
    latest_backup?: string
    backup_started?: boolean
    backups: string[]
}

export default BackupData