import * as React from 'react';
import BackupDirView from './BackupDirView';
import BackupForm from './BackupForm';
import { Button, Stepper } from '@material-ui/core';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import BackupProgress from './BackupProgress';

class Backup extends React.Component<{ data: any }, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            backupStarted: { value: this.props.data.backupData.backup_started, state: 'Started' },
            basicConfig: this.props.data.basicConfig,
            ftpConfig: this.props.data.ftpConfig,
            directoryConfig: this.props.data.directoryConfig,
            activeStep: this.props.data.backupData.backup_started ? 2 : 0,
        }

        this.startBackup = this.startBackup.bind(this)
        this.cancelBackup = this.cancelBackup.bind(this)
        this.getSteps = this.getSteps.bind(this)
        this.getStepContent = this.getStepContent.bind(this)
        this.handleNext = this.handleNext.bind(this)
        this.handleBack = this.handleBack.bind(this)
    }

    handleNext() {
        this.setState({ activeStep: this.state.activeStep + 1 });
    }

    handleBack() {
        this.setState({ activeStep: this.state.activeStep - 1 });
    }

    getSteps() {
        return ['Test Connection', 'Start Backup', 'Backup Progress']
    }

    getStepContent(step: number) {
        return [
            <BackupForm data={{
                ftpConfig: this.state.ftpConfig,
                handleNext: this.handleNext,
            }} />,
            <Button
                color='primary'
                variant='contained'
                onClick={this.startBackup}
                className='mt-3'
            >
                Start Backup
            </Button>,
            <BackupProgress data={{
                backup_name: this.state.basicConfig.backupName.value,
                backup_started: this.state.backup_started,
                cancelBackup: this.cancelBackup
            }} />,
        ][step]
    }

    public render() {
        const steps = this.getSteps()
        return (
            <div className="d-flex mx-5" style={{ marginTop: 10 + 'vh', marginBottom: 7 + 'vh' }}>
                <BackupDirView data={{ savedDirs: this.state.directoryConfig.savedDirs }} />
                <div className='w-100'>
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
                </div>
            </div>
        )
    }

    startBackup() {
        fetch('/AndroidFTPBackup/api/start_backup?backup_name=' + this.props.data.backupData.selectedConfig)
        let backupStarted = this.state.backupStarted
        backupStarted.value = true
        this.setState({ backupStarted: backupStarted, activeStep: this.state.activeStep + 1 })
    }

    cancelBackup() {
        fetch('/AndroidFTPBackup/api/cancel_backup?backup_name=' + this.props.data.backupData.selectedConfig)
        let backupStarted = this.state.backupStarted
        backupStarted.value = true
        backupStarted.state = 'Cancelled'
        this.setState({ backupStarted: backupStarted })
    }
}

export default Backup;
