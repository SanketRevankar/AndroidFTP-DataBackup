import * as React from 'react';
import Footer from './Footer';
import Dashboard from './dashboard/Dashboard';
import Backup from './backup/Backup';
import BackupConfigView from './backup_config/BackupConfigView';
import { Switch, Route, Redirect } from "react-router-dom";
import Header from './Header';
import Directory from './model/Directory';
import BasicConfig from './model/config/BasicConfig';
import FtpConfig from './model/config/FtpConfig';
import BackupStatus from './model/BackupStatus';
import WebDirectoryConfig from './model/config/WebDirectoryConfig';
import BackupConfigService from './service/BackupConfigService';
import Loading from './utils/Loading';

interface MainProp {
    switchTheme: Function
    themeType: string
}

interface MainState {
    configLoaded: boolean
    backups: string[]
    backupStatus: BackupStatus
    basicConfig: BasicConfig
    ftpConfig: FtpConfig
    directoryConfig: WebDirectoryConfig
}

class Main extends React.Component<MainProp, MainState> {

    constructor(props: MainProp) {
        super(props)

        this.state = {
            configLoaded: false,
            backups: [],
            backupStatus: new BackupStatus(),
            basicConfig: new BasicConfig(),
            ftpConfig: new FtpConfig(),
            directoryConfig: new WebDirectoryConfig(),
        };

        this.readConfig = this.readConfig.bind(this)
    }

    public componentDidMount() {
        this.loadBackups()
    }

    public render() {
        if (!this.state.configLoaded) {
            return <Loading />
        }

        if (this.state.backups.length === 0 && window.location.pathname !== '/AndroidFTPBackup/config/new') {
            window.location.href = '/AndroidFTPBackup/config/new'
        }

        return (
            <div>
                <Header
                    readConfig={this.readConfig} switchTheme={this.props.switchTheme}
                    themeType={this.props.themeType} backupData={this.state.backupStatus}
                    backup_name={this.state.basicConfig.name} backups={this.state.backups}
                />
                <Switch>
                    <Route path="/dashboard">
                        <Dashboard backupLocation={this.state.basicConfig.location} />
                    </Route>
                    <Route path="/backup">
                        <Backup
                            backupData={this.state.backupStatus} basicConfig={this.state.basicConfig}
                            ftpConfig={this.state.ftpConfig} directoryConfig={this.state.directoryConfig}
                            readConfig={this.readConfig}
                        />
                    </Route>
                    <Route path="/config/:mode" render={props => (
                        <BackupConfigView
                            basicConfig={this.state.basicConfig} ftpConfig={this.state.ftpConfig}
                            directoryConfig={this.state.directoryConfig} key={props.match.params.mode}
                        />
                    )} />
                    <Redirect from="/" to="/dashboard" />
                </Switch>
                <Footer latest_backup={this.state.backupStatus.latestBackup} />
            </div>
        )
    }

    loadBackups() {
        const selected = localStorage.getItem("selected")

        BackupConfigService().getBackups()
            .then(data => {
                let selectedConfig
                if (selected && data.backups.includes(selected)) {
                    selectedConfig = selected
                } else {
                    selectedConfig = data.backups.length > 0 ? data.backups[0] : undefined
                }
                this.setState({ backups: data.backups, configLoaded: !Boolean(selectedConfig) })
                if (selectedConfig) {
                    this.readConfig(selectedConfig)
                }
            })
    }

    readConfig(config: string) {
        localStorage.setItem("selected", config)

        BackupConfigService().getConfig(config)
            .then(data => {
                this.setState({
                    basicConfig: data.config.basic, ftpConfig: data.config.ftp, configLoaded: true,
                    directoryConfig: {
                        dirs: { '': new Directory('', 'root', '') }, expanded: [''],
                        backupDirs: data.config.dirs.backupDirs
                    },
                    backupStatus: {
                        selectedConfig: config,
                        latestBackup: data.latest_backup,
                        backupStarted: data.backup_started,
                    },
                })
            })
    }
}

export default Main;
