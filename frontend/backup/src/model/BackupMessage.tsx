export default interface BackupMessage {
    type: string
    id: string
    message: string
    state: BackupState
    value: string
    target: string
    backup_name: string
}

export enum BackupState {
    Saved = 'Saved',
    Copying = 'Copying',
    Error = 'Error',
    Started = 'Started',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    EnterDirectory = 'Enter Directory',
    Scanning = 'Scanning',
    ConnectionFailed = 'Connection Failed',
}
