import * as React from 'react';
import Header from './Header';
import Footer from './Footer';
import Dashboard from './Dashboard';
import Backup from './Backup';
import BackupConfig from './BackupConfig';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class App extends React.Component<{}, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            context: {},
            contextLoaded: false,
            modalShow: false,
            selectedConfig: null,
            currentPage: null,
        };

        this.loadBackupPage = this.loadBackupPage.bind(this)
        this.loadDashboard = this.loadDashboard.bind(this)
        this.loadConfigPage = this.loadConfigPage.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleConfirm = this.handleConfirm.bind(this)
        this.showConfigModal = this.showConfigModal.bind(this)
        this.configSelected = this.configSelected.bind(this)
        this.loadContext = this.loadContext.bind(this)
    }

    public componentDidMount() {
        this.loadContext(null)
    }

    public render() {
        if (!this.state.contextLoaded) {
            return ''
        }
        const data = {
            context: this.state.context,
            loadDashboard: this.loadDashboard,
            loadBackupPage: this.loadBackupPage,
            loadConfigPage: this.loadConfigPage,
            showConfigModal: this.showConfigModal,
        }
        let backups = ''
        if (this.state.context.backups !== undefined) {
            backups = this.state.context.backups.map((item: any) => {
                return (
                    <div className="custom-control custom-radio" key={item}>
                        <input type="radio" id={item} name="customRadio" className="custom-control-input" onChange={this.configSelected}
                            checked={item === this.state.selectedConfig} />
                        <label className="custom-control-label" htmlFor={item}>{item}</label>
                    </div>
                )
            })
        }

        return (
            <div>
                <Header data={data} />
                {this.state.context.backup_config ?
                    <BackupConfig data={data} />
                    :
                    (
                        this.state.context.dashboard ?
                            <Dashboard data={this.state.context} />
                            :
                            <Backup data={this.state.context} />
                    )
                }

                <Modal show={this.state.modalShow} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Config</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{backups}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Close</Button>
                        <Button variant="primary" onClick={this.handleConfirm}>Load Selected</Button>
                    </Modal.Footer>
                </Modal>
                <Footer data={this.state.context} />
            </div>
        )
    }

    loadContext(loadExisting: any) {
        fetch('/AndroidFTPBackup/api/load_context')
            .then(response => response.json())
            .then(data => {
                if (this.state.currentPage !== null) {
                    delete data.dashboard
                    delete data.backup_config
                    delete data.backup
                    data[this.state.currentPage] = true
                }
                if (loadExisting !== null) {
                    data.loadExisting = loadExisting
                }
                this.setState({ context: data, contextLoaded: true, selectedConfig: data.backup_name })
            });
    }

    configSelected(event: any) {
        this.setState({ selectedConfig: event.target.id })
    }

    handleClose() {
        this.setState({ modalShow: false })
    }

    handleConfirm(event: any) {
        fetch('/AndroidFTPBackup/api/set_config?name=' + this.state.selectedConfig)
            .then(data => {
                this.setState({ contextLoaded: false })
                this.loadContext(this.state.context.loadExisting)
                this.handleClose()
            })
    }

    showConfigModal() {
        this.setState({ modalShow: true })
    }

    loadBackupPage(backup_name: string) {
        const context = this.state.context
        delete context.dashboard
        delete context.backup_config
        delete context.loadExisting
        context['backup'] = true
        if (backup_name !== null) {
            context['backup_name'] = backup_name
            context['backups'] = [backup_name]
        }
        window.history.pushState(null, '', '/AndroidFTPBackup/react/backup')
        this.setState({ context: context, currentPage: 'backup' })
    }

    loadDashboard() {
        const context = this.state.context
        delete context.backup_config
        delete context.backup
        delete context.loadExisting
        context['dashboard'] = true
        window.history.pushState(null, '', '/AndroidFTPBackup/react/dashboard')
        this.setState({ context: context, currentPage: 'dashboard' })
    }

    loadConfigPage(loadExisting: boolean) {
        const context = this.state.context
        delete context.dashboard
        delete context.backup
        context['backup_config'] = true
        context['loadExisting'] = loadExisting
        window.history.pushState(null, '', '/AndroidFTPBackup/react/config')
        this.setState({ context: context, currentPage: 'backup_config' })
    }

}

export default App;
