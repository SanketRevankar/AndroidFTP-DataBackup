import { TextField } from '@material-ui/core';
import * as React from 'react';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import StarRoundedIcon from '@material-ui/icons/StarRounded';
import { InputAdornment } from '@material-ui/core';
import Button from '@material-ui/core/Button';

class BackupBasicDetails extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            mode: this.props.data.mode,
            backupName: this.props.data.basicConfig.backupName,
            backupLocation: this.props.data.basicConfig.backupLocation,
            nmapRange: this.props.data.basicConfig.nmapRange,
        }

        this.validateBackupName = this.validateBackupName.bind(this)
        this.validateBackupLocation = this.validateBackupLocation.bind(this)
        this.validateNmapRange = this.validateNmapRange.bind(this)
        this.updateProp = this.updateProp.bind(this)
        this.getInputProps = this.getInputProps.bind(this)
        this.validateBackupDetails = this.validateBackupDetails.bind(this)
    }

    render() {
        return <div>
            <TextField
                label="Backup Name"
                variant="outlined"
                color='secondary'
                className={'w-100 mt-2 valid-' + this.state.backupName.valid}
                value={this.state.backupName.value}
                onChange={this.validateBackupName}
                helperText="Backup Name to identify the phone to backup."
                InputProps={this.getInputProps(this.state.backupName.valid)}
            />

            <TextField
                label="Backup Location"
                variant="outlined"
                color='secondary'
                className={'mt-3 w-100 valid-' + this.state.backupLocation.valid}
                value={this.state.backupLocation.value}
                onChange={(e) => this.updateProp(e, 'backupLocation')}
                onBlur={this.validateBackupLocation}
                helperText="Backup location cannot be a Drive, create a folder and paste the path here."
                InputProps={this.getInputProps(this.state.backupLocation.valid)}
            />

            <TextField
                label="Local IP range for Nmap Scan"
                variant="outlined"
                color='secondary'
                className={'w-100 mt-3 valid-' + this.state.nmapRange.valid}
                value={this.state.nmapRange.value}
                onChange={(e) => this.updateProp(e, 'nmapRange')}
                onBlur={this.validateNmapRange}
                helperText="Use CIDR Notation, given IP range is default for most cases."
                InputProps={this.getInputProps(this.state.nmapRange.valid)}
            />

            <div className='mt-3'>
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.validateBackupDetails}
                    >Scan</Button>
                </div>
            </div>
        </div>
    }

    validateBackupName(event: any) {
        if (this.state.mode === 'edit') {
            return
        }
        event.preventDefault();
        const backupName = this.state.backupName
        backupName.value = event.target.value

        if (event.target.value.length === 0) {
            backupName.valid = false
        } else {
            backupName.valid = true
        }
        this.setState({ backupName: backupName })
    }

    validateNmapRange(event: any) {
        event.preventDefault();
        const nmapRange = this.state.nmapRange
        if (!event.target.value.match('^([0-9]{1,3}\\.){3}[0-9]{1,3}(\\/([0-9]|[1-2][0-9]|3[0-2]))?$')) {
            nmapRange.valid = false
        } else {
            nmapRange.valid = true
        }
        this.setState({ nmapRange: nmapRange })
    }

    validateBackupLocation(event: any) {
        event.preventDefault();
        const backupLocation = this.state.backupLocation
        if (!event.target.value.match('^[a-zA-Z]:\\/\\w(\\w+\\/)*\\w*$')) {
            backupLocation.valid = false
        } else {
            backupLocation.valid = true
        }
        this.setState({ backupLocation: backupLocation })
    }

    updateProp(event: any, prop: string) {
        event.preventDefault();
        const configProp = this.state[prop]
        configProp.value = event.target.value
        this.setState({ prop: configProp })
    }

    getInputProps(valid: boolean | undefined) {
        switch (valid) {
            case true: return { 'endAdornment': <InputAdornment position="end"><CheckCircleOutlineIcon /></InputAdornment> }
            case false: return { 'endAdornment': <InputAdornment position="end"><ErrorOutlineIcon /></InputAdornment> }
            default: return { 'endAdornment': <InputAdornment position="end"><StarRoundedIcon /></InputAdornment> }
        }
    }

    validateBackupDetails() {
        let validationFailed = false;

        let backupName = this.state.backupName
        let backupLocation = this.state.backupLocation
        let nmapRange = this.state.nmapRange

        if (!this.state.backupName.valid) {
            backupName.valid = false
            validationFailed = true
        }

        if (!this.state.backupLocation.valid) {
            backupLocation.valid = false
            validationFailed = true
        }

        if (!this.state.nmapRange.valid) {
            nmapRange.valid = false
            validationFailed = true
        }

        if (validationFailed) {
            this.setState({
                backupName: backupName, nmapRange: nmapRange, backupLocation: backupLocation
            })
        }

        if (!validationFailed) {
            this.props.data.setConfig('basicConfig', {
                backupName: this.state.backupName,
                backupLocation: this.state.backupLocation,
                nmapRange: this.state.nmapRange
            })
        }
    }


}

export default BackupBasicDetails;