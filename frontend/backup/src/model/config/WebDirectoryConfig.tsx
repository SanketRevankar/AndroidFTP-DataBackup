import BackupDirectoryConfig from "./BackupDirectoryConfig";
import Directory from "../Directory";

export default class WebDirectoryConfig extends BackupDirectoryConfig {
    dirs = { '': new Directory('', 'root', '') }
    expanded: string[] = []
}
