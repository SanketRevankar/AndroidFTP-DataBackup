import BasicConfig from "./BasicConfig"
import FtpConfig from "./FtpConfig"
import BackupDirectoryConfig from "./BackupDirectoryConfig"

export default interface BackupConfig {
    basic: BasicConfig
    ftp: FtpConfig
    dirs: BackupDirectoryConfig
}
