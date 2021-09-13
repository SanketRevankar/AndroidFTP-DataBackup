import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { Stepper, Card, CardHeader } from '@material-ui/core';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import SettingsIcon from '@material-ui/icons/Settings';
import BackupBasicDetails from './BackupConfigDetails';
import BackupFtpDetails from './BackupFtpDetails';
import BackupDirDetails from './BackupDirDetails';
import BackupLocationDetails from './BackupLocationDetails';
import BasicConfig from '../models/BasicConfig';
import FtpConfig from '../models/FtpConfig';
import DirectoryConfig from '../models/DirectoryConfig';
import BackupConfigPreview from './BackupConfigPreview';

class BackupConfig extends React.Component<{ history: any, location: any, match: any, data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            initialLoad: false,
            activeStep: 0,
            basicConfig: new BasicConfig(),
            ftpConfig: new FtpConfig(),
            directoryConfig: new DirectoryConfig(),
            foldersClass: '',
            loadExisting: false,
            backupSaved: false
        };

        this.setConfig = this.setConfig.bind(this)
        this.saveConfig = this.saveConfig.bind(this)
        this.getCardHeader = this.getCardHeader.bind(this)
        this.getStepper = this.getStepper.bind(this)
        // Stepper
        this.getSteps = this.getSteps.bind(this)
        this.getStepContent = this.getStepContent.bind(this)
        this.handleBack = this.handleBack.bind(this)
    }

    public componentDidMount() {
        const mode = this.props.match.params.name
        if (mode !== 'new') {
            this.setState({
                _isMounted: true,
                basicConfig: this.props.data.basicConfig,
                ftpConfig: this.props.data.ftpConfig,
                directoryConfig: this.props.data.directoryConfig,
                initialLoad: true,
                mode: mode,
            })
        } else {
            this.setState({
                initialLoad: true,
                _isMounted: true,
                mode: mode,
            })
        }
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.controller.abort()
    }

    public render() {
        if (this.state.backupSaved) {
            return <Redirect to='/backup' key={new Date().toDateString()} />
        }

        if (!this.state.initialLoad) {
            return ''
        }

        return (
            <div className="container" style={{ marginTop: 10 + 'vh', marginBottom: 7 + 'vh' }}>
                {this.getCardHeader()}
                {this.getStepper()}
            </div >
        )
    }

    getSteps() {
        return ['Backup Details', 'FTP Details', 'Folders to Backup', 'Backup Destination', 'Preview Config']
    }

    getStepContent(step: number) {
        return [
            this.getBasicDetailsForm(),
            this.getBackupFtpDetailsForm(),
            this.getBackupDirDetailsFrom(),
            this.getBackupLocationDetailsForm(),
            this.getBackupConfigPreview()
        ][step]
    }

    setConfig(name: string, obj: any) {
        this.setState({ [name]: obj, activeStep: this.state.activeStep + 1 })
    }

    handleBack() {
        this.setState({ activeStep: this.state.activeStep - 1 });
    }

    getCardHeader() {
        return (
            <Card className='mb-3'>
                <CardHeader className='py-3'
                    avatar={
                        <SettingsIcon />
                    }
                    title='Backup Configuration'
                    subheader={this.state.mode == 'new' ? 'New Config' : this.state.basicConfig.backupName.value}
                    titleTypographyProps={{ variant: "h6" }}
                >
                </CardHeader>
            </Card>
        )
    }

    getStepper() {
        const steps = this.getSteps()
        return (
            <Stepper activeStep={this.state.activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            {this.getStepContent(index)}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        )
    }

    getCookie(name: any) {
        var cookieValue = '';
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    saveConfig() {
        const configData = {
            basicConfig: this.state.basicConfig,
            ftpConfig: this.state.ftpConfig,
            directoryConfig: this.state.directoryConfig,
        }

        const csrftoken = this.getCookie('csrftoken');
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('X-CSRFToken', csrftoken);
        requestHeaders.set('Content-Type', 'application/json');

        fetch('/AndroidFTPBackup/api/save_config', {
            method: 'POST',
            body: JSON.stringify(configData),
            headers: requestHeaders,
            signal: this.controller.signal
        }).then(() => {
            window.history.pushState({ urlPath: '/AndroidFTPBackup/backup' }, '', '/AndroidFTPBackup/backup')
            setTimeout(function(){ window.location.reload() }, 500)
        }).catch(error => {
            console.log(error);
        })
    }

    getBasicDetailsForm() {
        return <BackupBasicDetails data={{
            basicConfig: this.state.basicConfig,
            mode: this.state.mode,
            setConfig: this.setConfig
        }} />
    }

    getBackupFtpDetailsForm() {
        return <BackupFtpDetails data={{
            ftpConfig: this.state.ftpConfig,
            nmapRange: this.state.basicConfig.nmapRange,
            handleBack: this.handleBack,
            getCookie: this.getCookie,
            setConfig: this.setConfig,
        }} />
    }

    getBackupDirDetailsFrom() {
        return <BackupDirDetails data={{
            directoryConfig: this.state.directoryConfig,
            backupLocation: this.state.basicConfig.backupLocation,
            ftpConfig: this.state.ftpConfig,
            expanded: this.state.expanded,
            getCookie: this.getCookie,
            setConfig: this.setConfig,
            handleBack: this.handleBack,
        }} />
    }

    getBackupLocationDetailsForm() {
        return <BackupLocationDetails data={{
            directoryConfig: this.state.directoryConfig,
            setConfig: this.setConfig,
            handleBack: this.handleBack,
        }} />
    }

    getBackupConfigPreview() {
        return <BackupConfigPreview data={{
            ...this.state,
            saveConfig: this.saveConfig,
            handleBack: this.handleBack,
        }} />
    }
}

export default BackupConfig;

