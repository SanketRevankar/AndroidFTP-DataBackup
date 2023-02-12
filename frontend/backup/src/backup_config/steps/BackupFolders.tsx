import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CachedIcon from '@mui/icons-material/Cached';
import Directory from '../../model/Directory';
import { Typography, Button, IconButton, Tooltip, Checkbox, Divider, Box } from '@mui/material';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import FtpConfig from 'src/model/config/FtpConfig';
import WebDirectoryConfig from 'src/model/config/WebDirectoryConfig';
import FtpService from 'src/service/FtpService';

interface BackupFoldersProps {
    directoryConfig: WebDirectoryConfig
    backupLocation: string
    ftpConfig: FtpConfig
    setDirectoryConfig: Function
    handleBack: () => void
    handleNext: Function
}

class BackupFolders extends React.Component<BackupFoldersProps, WebDirectoryConfig> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            dirs: { ...this.props.directoryConfig.dirs },
            backupDirs: [...this.props.directoryConfig.backupDirs],
            expanded: [...this.props.directoryConfig.expanded],
        }

        this.toggleSwitch = this.toggleSwitch.bind(this)
        this.renderTree = this.renderTree.bind(this)
        this.expandTree = this.expandTree.bind(this)
        this.validate = this.validate.bind(this)
    }

    public componentDidMount() {
        this.loadDirs(this.state.dirs[''])
    }

    componentWillUnmount() {
        this.controller.abort()
    }

    render() {
        return <div>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                Backup Folders
            </Typography>
            <Divider className='my-3' />
            <Typography variant='h6' className='my-2'>
                Select atleast 1 folder to backup, use <CachedIcon color='secondary' /> to load sub-folders.
            </Typography>
            <Box style={{ maxHeight: '60vh', overflow: 'overlay', width: '75vw' }}>
                <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    expanded={this.state.expanded}
                    onNodeToggle={this.expandTree}
                >
                    {this.renderTree(this.state.dirs[''])}
                </TreeView>
            </Box>
            <div className='mt-4 d-flex justify-content-between'>
                <Button variant="contained" color="primary" onClick={this.validate}>
                    Next
                </Button>
                <Button onClick={this.props.handleBack} color="error" variant="outlined" >
                    Back
                </Button>
            </div>
        </div>
    }

    renderTree(nodes: Directory) {
        return (
            <TreeItem
                key={nodes.name} nodeId={nodes.path}
                label={
                    <div>
                        <IconButton onClick={(event) => { event.stopPropagation(); this.loadDirs(nodes) }}>
                            <CachedIcon color='secondary' />
                        </IconButton>
                        <Tooltip title={<h6 className='my-1'>Backup '{nodes.name}' folder</h6>}>
                            <Checkbox
                                checked={nodes.selected} onClick={(event) => { event.stopPropagation(); }}
                                onChange={() => { this.toggleSwitch(nodes, 'selected') }}
                            />
                        </Tooltip>
                        {nodes.name}
                    </div>
                }
            >
                {Array.isArray(nodes.subDirectories) ? nodes.subDirectories.map((node) => this.renderTree(this.state.dirs[node])) : null}
            </TreeItem>
        )
    }

    validate() {
        if (this.validateDirs(this.state.dirs[''])) {
            this.props.setDirectoryConfig({
                dirs: this.state.dirs,
                expanded: this.state.expanded,
                savedDirs: this.state.backupDirs
            })
            this.props.handleNext()
        }
    }

    validateDirs(dir: Directory) {
        if (dir.selected) {
            return true
        }
        if (dir.subDirectories) {
            for (var i = 0; i < dir.subDirectories.length; i++) {
                if (this.validateDirs(this.state.dirs[dir.subDirectories[i]])) {
                    return true
                }
            }
        }
        return false
    }

    toggleSwitch(dirTree: Directory, param: string) {
        let dirs = this.state.dirs
        dirs[dirTree.path][param] = !dirs[dirTree.path][param]
        this.setState({ dirs: dirs })
    }

    loadDirs(rootDir: Directory) {
        return new Promise<void>((resolve) => {
            const ftpData = {
                ip: this.props.ftpConfig.device.ip, userId: this.props.ftpConfig.userId,
                password: this.props.ftpConfig.password,
                port: this.props.ftpConfig.port, path: rootDir.path,
            }

            FtpService().loadDirData(ftpData, this.controller)
                .then(data => {
                    let dirs = this.state.dirs
                    dirs[rootDir.path].subDirectories = []
                    let nextExtend: string[] = []
                    data.dirs.forEach((name: string) => {
                        const path = rootDir.path + "/" + name
                        dirs[rootDir.path].subDirectories.push(path)
                        dirs[path] = new Directory(path, name, this.props.backupLocation + path)
                    })
                    this.state.backupDirs?.forEach((savedDir) => {
                        if (dirs[savedDir.path]) {
                            dirs[savedDir.path] = new Directory(savedDir.path, savedDir.path.substring(savedDir.path.lastIndexOf('/') + 1),
                                savedDir.backupLocation, savedDir.monthSeparated, savedDir.recursive, true)
                        } else {
                            if (savedDir.path.startsWith(rootDir.path)) {
                                const next = savedDir.path.substring(0, savedDir.path.indexOf('/', rootDir.path.length + 1))
                                if (!nextExtend.includes(next)) {
                                    nextExtend.push(next)
                                }
                            }
                        }
                    })
                    let expanded = this.state.expanded
                    expanded.push(rootDir.path)

                    this.setState({
                        dirs: dirs, expanded: expanded
                    })

                    if (nextExtend.length > 0) {
                        nextExtend.reduce((previous, current, index, array) => {
                            return previous.then(() => { return this.loadDirs(dirs[array[index]]) })
                        }, Promise.resolve())
                    }
                }).then(() => {
                    resolve()
                })
        })
    }

    expandTree(event: React.ChangeEvent<{}>, nodeIds: string[]) {
        this.setState({ expanded: nodeIds })
    }
}

export default BackupFolders;