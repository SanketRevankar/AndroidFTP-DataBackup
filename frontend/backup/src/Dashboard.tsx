import * as React from 'react';
import { Chart } from "react-google-charts";

class Dashboard extends React.Component<{ data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            total_size: '0',
            context: {},
            data_size: [],
            data_count: [],
            side_panel_data: '',
            current_dir: '',
            last_dir: '',
        };

        this.loadLocation = this.loadLocation.bind(this)
        this.upDirectory = this.upDirectory.bind(this)
        this.handleFolderOpen = this.handleFolderOpen.bind(this)
        this.handleFileOpen = this.handleFileOpen.bind(this)
    }

    public componentDidMount() {
        fetch('/AndroidFTPBackup/api/get-chart?id=', { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => this.setState({ data_size: data['size_chart_data'], data_count: data['count_chart_data'] }))
            .catch();
        fetch('/AndroidFTPBackup/api/load_dir_data?query=', { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => { this.setState({ side_panel_data: data, total_size: data['current_size'] })})
            .catch();
    }

    componentWillUnmount() {
        this.controller.abort()
    }

    public render() {
        const pieOptions = {
            fontName: "'Salsa', cursive",
            pieHole: 0.4,
            height: "100%"
        }
 
        let folders = ''
        let files = ''
        if (this.state.side_panel_data.length !== 0) {
            folders = this.state.side_panel_data.folders.map((item: any) => {
                return (
                    <button type="button" className="list-group-item list-group-item-action" id="next_dir" name={item[0]} key={item[0]}
                        onClick={() => this.handleFolderOpen(item[0])}>
                        <i className="fas fa-folder-open mr-1"></i>
                        <span>{item[0]}</span>
                        <span className="badge badge-pill badge-dark size-badge">{item[1]}</span>
                    </button>
                )
            });
            files = this.state.side_panel_data.files.map((item: any) => {
                return (
                    <button type="button" className="list-group-item list-group-item-action" id="next_dir" name={item[0]} key={item[0]}
                        onClick={() => this.handleFileOpen(item[0])}>
                        <i className="fas fa-file mr-2"></i>
                        <span>{item[0]}</span>
                        <span className="badge badge-pill badge-dark size-badge">{item[1]}</span>
                    </button>
                )
            });
        }
        return (
            <div>
                <div className="div-container">
                    <div className="half-block">
                        <i className="fas fa-folder-open top-info"></i>
                        <button className="btn btn-primary" onClick={() => this.handleFileOpen('')}>Open Backup Folder</button>
                        <i className="fas fa-hdd top-info" title="Disk Space Used"></i>
                        <span className="badge badge-primary badge-top" id="total-size">{this.state.total_size}</span>
                        <div id="size-chart" className="google-chart">
                            {/* @ts-ignore */}
                            <Chart chartType="PieChart" data={this.state.data_size} options={{ ...pieOptions, title: "Disk Space used in GB" }} />
                        </div>
                        <div id="count-chart" className="google-chart">
                            {/* @ts-ignore */}
                            <Chart chartType="PieChart" data={this.state.data_count} options={{ ...pieOptions, title: "Number of files" }} />
                        </div>
                    </div>
                    <div className="half-block">
                        <div id="backup_dir">
                            <li className="list-group-item list-group-item-action list-group-item-secondary list-header">
                                <a href="#" className="fas fa-chevron-circle-left back-button text-light text-decoration-none"
                                    onClick={() => this.upDirectory()}></a>
                                {this.state.side_panel_data.current_dir}
                                <span className="badge badge-pill badge-light size-badge">
                                    {this.state.side_panel_data.current_size}
                                </span>
                            </li>
                            <div className="list-group list-group-flush list-group-div">
                                {folders}
                                {files}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    handleFolderOpen(query: string) {
        this.loadLocation(this.state.current_dir + '/' + query)
    }

    handleFileOpen(query: string) {
        fetch('/AndroidFTPBackup/api/open_?query=' + this.state.current_dir + '/' + query, { signal: this.controller.signal })
    }

    upDirectory() {
        if (this.state.current_dir.length === 0) {
            this.loadLocation('')
        } else {
            const lastSlash = this.state.current_dir.lastIndexOf('/');
            this.loadLocation(this.state.current_dir.slice(0, lastSlash))
        }
    }

    loadLocation(query: string) {
        fetch('/AndroidFTPBackup/api/load_dir_data?query=' + query, { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => this.setState({
                last_dir: this.state.last_dir.length <= this.state.current_dir.length ? this.state.last_dir : this.state.current_dir,
                current_dir: query,
                side_panel_data: data
            }));
    }
}

export default Dashboard;
