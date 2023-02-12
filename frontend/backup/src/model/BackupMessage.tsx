export default interface BackupMessage {
    type: string
    id: string
    message: string
    state: BackupState
    value: string
    target: string
    backup_name: string
}


export type BackupState = 'Saved' | 'Copying' | 'Error' | 'Started' | 'Completed' | 'Cancelled' | 'EnterDirectory' | 'Scanning'
