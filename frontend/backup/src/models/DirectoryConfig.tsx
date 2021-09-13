import Directory from "./Directory";

class DirectoryConfig {
    dirs = { '': new Directory('', 'root', '') }
    expanded = ['']
    savedDirs = []
}

export default DirectoryConfig;