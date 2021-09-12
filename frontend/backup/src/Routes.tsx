import * as React from 'react';
import Footer from './Footer';
import Dashboard from './Dashboard';
import Backup from './backup/Backup';
import BackupConfig from './backup_config/BackupConfig';
import { Switch, Route, Redirect } from "react-router-dom";
import Header from './Header';
import ConfigProp from './models/ConfigProp';
import DeviceProp from './models/DeviceProp';
import Directory from './models/Directory';
import BasicConfig from './models/BasicConfig';
import DirectoryConfig from './models/DirectoryConfig';
import FtpConfig from './models/FtpConfig';
import BackupData from './models/BackupData';


class Routes extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            configLoaded: false,
            backupData: null,
            basicConfig: new BasicConfig(),
            ftpConfig: new FtpConfig(),
            directoryConfig: new DirectoryConfig(),
        };
    }

    public componentDidMount() {
        this.readConfig()
    }

    public render() {
        if (!this.state.configLoaded) {
            return ''
        }

        if (this.state.backupData.backups.length === 0 && window.location.pathname != '/AndroidFTPBackup/config/new') {
            window.history.pushState({ urlPath: '/AndroidFTPBackup/config/new' }, '', '/AndroidFTPBackup/config/new');
            setTimeout(function(){ window.location.reload() }, 500)
        }

        return (
            <div>
                <Header data={{
                    readConfig: this.readConfig,
                    switchTheme: this.props.data.switchTheme,
                    themeType: this.props.data.themeType,
                    backupData: this.state.backupData,
                    backup_name: this.state.basicConfig.backupName.value,
                }} />
                {this.getRouter()}
                <Footer data={{ latest_backup: this.state.backupData.latest_backup }} />
            </div>
        )
    }

    getRouter() {
        return (
            <Switch>
                <Route path="/dashboard">
                    <Dashboard data={{ ...this.state.context, themeType: this.props.data.themeType }} />
                </Route>
                <Route path="/backup">
                    <Backup data={{
                        backupData: this.state.backupData,
                        basicConfig: this.state.basicConfig,
                        ftpConfig: this.state.ftpConfig,
                        directoryConfig: this.state.directoryConfig,
                    }} />
                </Route>
                <Route path="/config/:name" render={props => <BackupConfig data={{
                    basicConfig: this.state.basicConfig,
                    ftpConfig: this.state.ftpConfig,
                    directoryConfig: this.state.directoryConfig,
                    readConfig: this.readConfig,
                }} {...props} key={props.match.params.name} />} />
                <Redirect from="/" to="/dashboard" />
            </Switch>
        )
    }


    readConfig() {
        fetch('/AndroidFTPBackup/api/get_config')
            .then(response => response.json())
            .then(data => {
                if (data.backups.length == 0) {
                    const backupData: BackupData = {
                        backups: data.backups,
                    }

                    this.setState({
                        backupData: backupData,
                        configLoaded: true,
                    })
                } else {
                    const basicConfig: BasicConfig = {
                        backupName: new ConfigProp(data.config.ID.backup_name, true),
                        backupLocation: new ConfigProp(data.config.Path.backup_folder, true),
                        nmapRange: new ConfigProp(data.config.Nmap.hosts, true)
                    }

                    const ftpConfig: FtpConfig = {
                        selectDevice: new DeviceProp(data.config.FTP.ftp_ip, true, data.config.FTP.mac),
                        ftpUser: new ConfigProp(data.config.FTP.username),
                        ftpPass: new ConfigProp(data.config.FTP.password),
                        ftpPort: new ConfigProp(data.config.FTP.port),
                        ftpTested: true,
                        connections: [{
                            'ip': data.config.FTP.ftp_ip,
                            'mac': data.config.FTP.mac,
                        }]
                    }

                    const directoryConfig: DirectoryConfig = {
                        dirs: { '': new Directory('', 'root', '') },
                        expanded: [''],
                        savedDirs: data.config.Path.folders.map((folder: any) => (
                            new Directory(folder[0], folder[0], folder[1], folder[2], folder[3])
                        ))
                    }

                    const backupData: BackupData = {
                        selectedConfig: basicConfig.backupName.value,
                        latest_backup: data.latest_backup,
                        backup_started: data.backup_started,
                        backups: data.backups,
                    }

                    this.setState({
                        basicConfig: basicConfig,
                        ftpConfig: ftpConfig,
                        directoryConfig: directoryConfig,
                        configLoaded: true,
                        backupData: backupData,
                    })
                }
            })
    }

}

export default Routes;
