import * as React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import Checkbox from '@material-ui/core/Checkbox';
import { Button, IconButton, Typography } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import Tooltip from '@material-ui/core/Tooltip';
import Directory from '../models/Directory';

class BackupDirDetails extends React.Component<{ data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            dirs: this.props.data.directoryConfig.dirs,
            savedDirs: this.props.data.directoryConfig.savedDirs,
            expanded: this.props.data.directoryConfig.expanded,
        }

        this.toggleSwitch = this.toggleSwitch.bind(this)
        this.renderTree = this.renderTree.bind(this)
        this.expandTree = this.expandTree.bind(this)
        this.validate = this.validate.bind(this)
    }

    public componentDidMount() {
        this.setState({ _isMounted: true })
        this.loadDirs(this.state.dirs[''])
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.controller.abort()
    }

    render() {
        return <div>
            <Typography variant='h6' className='my-2'>
                Select atleast 1 folder to backup, use <CachedIcon color='secondary' /> to load sub-folders.
            </Typography>
            <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                expanded={this.state.expanded}
                onNodeToggle={this.expandTree}
            >
                {this.renderTree(this.state.dirs[''])}
            </TreeView>

            <div className='mt-3'>
                <div>
                    <Button
                        onClick={this.props.data.handleBack}
                        className='mr-2'
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.validate}
                    >Next</Button>
                </div>
            </div>
        </div>
    }

    renderTree(nodes: Directory) {
        return (
            <TreeItem
                key={nodes.path}
                nodeId={nodes.path}
                onLabelClick={(e) => { e.preventDefault() }}
                label={
                    <div>
                        <IconButton onClick={() => this.loadDirs(nodes)}>
                            <CachedIcon color='secondary' />
                        </IconButton>
                        <Tooltip title={<h6 className='my-1'>Backup '{nodes.name}' folder</h6>}>
                            <Checkbox
                                checked={nodes.selected}
                                onChange={() => this.toggleSwitch(nodes, 'selected')}
                            />
                        </Tooltip>
                        {nodes.name}
                    </div>
                }>
                {Array.isArray(nodes.subDirectories) ? nodes.subDirectories.map((node) => this.renderTree(this.state.dirs[node])) : null}
            </TreeItem >
        )
    }

    validate() {
        if (this.validateDirs(this.state.dirs[''])) {
            this.props.data.setConfig('directoryConfig', {
                dirs: this.state.dirs,
                expanded: this.state.expanded,
                savedDirs: this.state.savedDirs
            })
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
            const ftp_data = {
                ip: this.props.data.ftpConfig.selectDevice.value,
                name: this.props.data.ftpConfig.ftpUser.value,
                pass: this.props.data.ftpConfig.ftpPass.value,
                port: this.props.data.ftpConfig.ftpPort.value,
                path: rootDir.path,
            }

            const csrftoken = this.props.data.getCookie('csrftoken');
            const requestHeaders: HeadersInit = new Headers();
            requestHeaders.set('X-CSRFToken', csrftoken);
            requestHeaders.set('Content-Type', 'application/json');

            fetch('/AndroidFTPBackup/api/get_dirs', {
                method: 'POST',
                body: JSON.stringify(ftp_data),
                headers: requestHeaders,
                signal: this.controller.signal
            })
                .then(response => response.json())
                .then(data => {
                    let dirs = this.state.dirs
                    dirs[rootDir.path].subDirectories = []
                    let nextExtend: string[] = []
                    data.dirs.map((name: string) => {
                        const path = rootDir.path + "/" + name
                        dirs[rootDir.path].subDirectories.push(path)
                        dirs[path] = new Directory(path, name, this.props.data.backupLocation.value + path)
                    })
                    this.state.savedDirs.map((savedDir: any) => {
                        if (dirs[savedDir.path]) {
                            dirs[savedDir.path] = new Directory(savedDir.path, savedDir.name, savedDir.backupLocation, savedDir.monthSeparated, savedDir.recursive, true)
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
                            return previous
                                .then(() => { return this.loadDirs(dirs[array[index]]) })
                        }, Promise.resolve())
                    }
                }).then(() => {
                    resolve()
                })
        })
    }

    expandTree(event: React.ChangeEvent<{}>, nodeIds: string[]) {
        this.setState({ expanded: nodeIds })
    };

}

export default BackupDirDetails;