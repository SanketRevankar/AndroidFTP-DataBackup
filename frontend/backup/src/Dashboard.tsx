import * as React from 'react';
import { Chart } from "react-google-charts";
import DataUsageIcon from '@material-ui/icons/DataUsage';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Directory from './models/Directory';
import TreeItem from '@material-ui/lab/TreeItem';
import { Button, IconButton, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import DescriptionIcon from '@material-ui/icons/Description';
import Tooltip from '@material-ui/core/Tooltip';
import FolderIcon from '@material-ui/icons/Folder';
import { Skeleton } from '@material-ui/lab';

class Dashboard extends React.Component<{ data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            context: {},
            dirs: { '': new Directory('', '', '') },
            data_size: [],
            data_count: [],
            data_loaded: false,
            base_dir: '',
        };
        
        this.handleFileOpen = this.handleFileOpen.bind(this)
        this.renderTree = this.renderTree.bind(this)
        this.loadDirs = this.loadDirs.bind(this)
    }

    public componentDidMount() {
        this.loadDashData()
    }

    loadDashData() {
        this.loadDirs()
    }

    loadDirs() {
        const loadDirs = this.loadDirs 
        fetch('/AndroidFTPBackup/api/dashboard-data', { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (!data.initiated) {
                    setTimeout(function(){ loadDirs() }, 5000);
                    return
                }

                let dirs = {}
                {
                    Object.entries(data.dirs).map(([key, index]) => {
                        dirs[key] = {
                            path: key,
                            name: data.dirs[key].name,
                            subDirectories: data.dirs[key].folders,
                            files: data.dirs[key].files,
                            backupLocation: ''
                        }
                    })
                }

                this.setState({
                    dirs: dirs,
                    data_loaded: true,
                    base_dir: data.base_dir,
                    data_size: data['size_chart_data'],
                    data_count: data['count_chart_data'],
                    total_size: data['total_size'],
                })
            })
            .catch(e => {
                console.log(e)
            });
            
    }

    componentWillUnmount() {
        this.controller.abort()
    }

    public render() {
        if (!this.state.data_loaded) {
            return this.loading()
        } else {
            return this.dashboard()
        }
    }

    loading() {
        return (
            <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: 100 + 'vh' }}>
                <Typography variant='h4' color='textSecondary'>
                    Loading
                </Typography>
                <Skeleton className='w-50' />
                <Skeleton className='w-50' animation="wave" />
            </div>
        )
    }

    dashboard() {
        return (
            <div style={{ marginTop: 10 + 'vh', marginBottom: 5 + 'vh' }}>
                <div className="d-flex">
                    {this.getStatistics()}
                    {this.getFiles()}
                </div>
            </div>
        )
    }

    getFiles() {
        return (
            <div className="w-50 mx-5">
                <Typography variant='h4'>
                    Backed up Files
                </Typography>
                <Paper className='w-100 mt-2 list-group-div' elevation={3}>
                    <TreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                        defaultExpanded={[this.state.base_dir]}
                        className='px-3 py-2'
                    >
                        {this.renderTree(this.state.dirs[this.state.base_dir])}
                    </TreeView>
                </Paper>
            </div>
        )
    }

    renderTree(nodes: Directory) {
        if (this.nodeHasSubDirectories(nodes) || this.nodeHasFiles(nodes)) {
            return this.getNonLeaf(nodes)
        } else {
            return this.getLeaf(nodes)

        }
    }

    nodeHasSubDirectories(nodes: Directory) {
        return nodes.subDirectories && nodes.subDirectories.length > 0
    }

    nodeHasFiles(nodes: Directory) {
        return nodes.files && nodes.files.length > 0
    }

    getLeaf(nodes: Directory) {
        return (
            <TreeItem
                key={nodes.path}
                nodeId={nodes.path}
                label={
                    <div className='align-items-center d-flex'>
                        <IconButton onClick={() => this.handleFileOpen(nodes.path)}>
                            <FolderOpenIcon />
                        </IconButton>
                        <h6 className='mb-0 mt-1'>
                            {nodes.name}
                        </h6>
                    </div>
                }>
            </TreeItem>
        )
    }

    getNonLeaf(nodes: Directory) {
        return (
            <TreeItem
                key={nodes.path}
                nodeId={nodes.path}
                onLabelClick={(e) => { e.preventDefault() }}
                label={
                    <div className='align-items-center d-flex'>
                        <IconButton onClick={() => this.handleFileOpen(nodes.path)}>
                            <FolderIcon />
                        </IconButton>
                        <h6 className='mb-0 mt-1'>
                            {nodes.name}
                        </h6>
                    </div>
                }>
                {this.getSubDirectories(nodes)}
                {this.getSubFiles(nodes)}
            </TreeItem >
        )
    }

    getSubDirectories(nodes: Directory) {
        if (this.isNotEmpty(nodes.subDirectories)) {
            // @ts-ignore
            return nodes.subDirectories.map((node) => (this.renderTree(this.state.dirs[nodes.path + "/" + node])))
        }
        return null
    }

    getSubFiles(nodes: Directory) {
        if (this.isNotEmpty(nodes.files)) {
            // @ts-ignore
            return nodes.files.map((node) => (this.renderFile(nodes.path + "/" + node, node)))
        }
        return null
    }

    isNotEmpty(data: string[] | undefined) {
        return data && data.length > 0
    }

    renderFile(path: string, name: string) {
        return (
            <TreeItem
                key={path}
                nodeId={path}
                label={
                    <div className='align-items-center d-flex'>
                        <Tooltip title={<h6 className='my-1'>Open '{path}'</h6>}>
                            <IconButton onClick={() => this.handleFileOpen(path)} color='secondary'>
                                <DescriptionIcon />
                            </IconButton>
                        </Tooltip>
                        <h6 className='mb-0 mt-1'>
                            {name}
                        </h6>
                    </div>
                }>
            </TreeItem >
        )
    }

    getStatistics() {
        return (
            <div className="w-50 mx-5">
                <div className='d-flex justify-content-center'>
                    <Button
                        onClick={() => this.handleFileOpen(this.state.base_dir)}
                        variant='contained'
                        color='primary'
                        className='mr-3'
                    >
                        <FolderOpenIcon className='mr-2' /> Open Backup Folder
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                    >
                        <DataUsageIcon className='mr-2' /> Total: {this.state.total_size}
                    </Button>
                </div>
                {this.getChart(this.state.data_size, "Disk Space used in GB")}
                {this.getChart(this.state.data_count, "Number of files")}
            </div>
        )
    }

    getChart(data: any, title: string) {
        return (
            <div className="google-chart mt-3">
                <Chart
                    chartType="PieChart"
                    data={data}
                    height='100%'
                    options={{ ...this.getPieOptions(), title: title }}
                />
            </div>
        )
    }

    getPieOptions() {
        const bgColor = this.props.data.themeType == 'dark' ? '#424242' : '#fafafa'
        const color = this.props.data.themeType == 'dark' ? '#fafafa' : '#424242'

        const pieOptions = {
            pieHole: 0.4,
            backgroundColor: bgColor,
            legend: {
                textStyle: { color: color }
            },
            pieSliceBorderColor: bgColor,
            titleTextStyle: {
                color: color
            },
        }

        return pieOptions
    }

    handleFileOpen(query: string) {
        fetch('/AndroidFTPBackup/api/open_?query=' + query, { signal: this.controller.signal })
    }

}

export default Dashboard;
