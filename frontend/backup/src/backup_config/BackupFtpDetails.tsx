import LoopRoundedIcon from '@material-ui/icons/LoopRounded';
import { Button, MenuItem, Typography } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import * as React from 'react';

class BackupFtpDetails extends React.Component<{ data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            selectDevice: this.props.data.ftpConfig.selectDevice,
            ftpUser: this.props.data.ftpConfig.ftpUser,
            ftpPass: this.props.data.ftpConfig.ftpPass,
            ftpPort: this.props.data.ftpConfig.ftpPort,
            ftpTested: this.props.data.ftpConfig.ftpTested,
            connections: this.props.data.ftpConfig.connections,
            statusMessage: '',
        }

        this.deviceSelect = this.deviceSelect.bind(this)
        this.updateFtpProp = this.updateFtpProp.bind(this)
        this.validateFTP = this.validateFTP.bind(this)
        this.getConnections = this.getConnections.bind(this)
    }

    componentDidMount() {
        this.setState({ _isMounted: true })
        if (!this.state.ftpTested) {
            this.getConnections()
        }
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.controller.abort()
    }

    render() {
        return <div>
            <TextField
                label='Choose your device'
                select
                variant="outlined"
                color='secondary'
                className={'w-100 mt-2 valid-' + this.state.selectDevice.valid}
                value={this.state.selectDevice.value}
                onChange={this.deviceSelect}
                InputProps={{
                    startAdornment: (<IconButton onClick={this.getConnections}>
                        <LoopRoundedIcon
                            className={this.state.selectDevice.loading ? 'fast-spin' : ''}
                        />
                    </IconButton>)
                }}
                inputProps={{ displayEmpty: true }}
            >
                <MenuItem key='default' value="" disabled>
                    {this.state.selectDevice.loading ? 'Loading...' : 'Choose your device'}
                </MenuItem>
                {this.state.connections.map((option: any) => (
                    <MenuItem key={option.ip} value={option.ip} id={option.mac}>
                        MAC: {option.mac} | IP: {option.ip} | Vendor: {option.vendor ? option.vendor : 'Not Known'}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                label="FTP Username"
                variant="outlined"
                color='secondary'
                className={'mt-3 mr-3 valid-' + this.state.ftpUser.valid}
                value={this.state.ftpUser.value}
                onChange={(e) => this.updateFtpProp(e, 'ftpUser')}
                helperText="Enter FTP Username"
            />

            <TextField
                label="FTP Password"
                variant="outlined"
                color='secondary'
                className={'mt-3 mr-3 valid-' + this.state.ftpPass.valid}
                value={this.state.ftpPass.value}
                onChange={(e) => this.updateFtpProp(e, 'ftpPass')}
                helperText="Enter FTP Password"
            />

            <TextField
                label="FTP Port"
                variant="outlined"
                color='secondary'
                className={'mt-3 ' + this.state.ftpPort.valid}
                value={this.state.ftpPort.value}
                onChange={(e) => this.updateFtpProp(e, 'ftpPort')}
                type='number'
                helperText="Enter FTP Port"
            />

            <Typography color='secondary' className='mt-3'>{this.state.statusMessage}</Typography>

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
                        onClick={this.validateFTP}
                    >Test</Button>
                </div>
            </div>
        </div>
    }

    deviceSelect(event: any) {
        const selectDevice = this.state.selectDevice
        selectDevice.valid = true
        selectDevice.macId = event.nativeEvent.target.id
        selectDevice.value = event.target.value
        this.setState({ selectDevice: selectDevice, ftpTested: false })
    }

    validateFTP() {
        if (this.state.selectDevice.value === '') {
            const selectDevice = this.state.selectDevice
            selectDevice.valid = false
            this.setState({ selectDevice: this.state.selectDevice })
            return
        }
        this.testFTP()
    }

    testFTP() {
        if (this.state.ftpTested) {
            this.props.data.setConfig('ftpConfig', this.props.data.ftpConfig)
            return
        }

        this.setState({ statusMessage: 'Testing FTP connection, Please wait...' })
        const ftp_data = {
            ip: this.state.selectDevice.value,
            name: this.state.ftpUser.value,
            pass: this.state.ftpPass.value,
            port: this.state.ftpPort.value,
            connections: this.state.connections
        }

        const csrftoken = this.props.data.getCookie('csrftoken');
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('X-CSRFToken', csrftoken);
        requestHeaders.set('Content-Type', 'application/json');

        fetch('/AndroidFTPBackup/api/test_connections', {
            method: 'POST',
            body: JSON.stringify(ftp_data),
            headers: requestHeaders,
            signal: this.controller.signal
        })
            .then(response => response.json())
            .then(data => {
                if (data.status_code == 0) {
                    this.setState({ statusMessage: '', ftpTested: true })
                    this.props.data.setConfig('ftpConfig', {
                        selectDevice: this.state.selectDevice,
                        ftpUser: this.state.ftpUser,
                        ftpPass: this.state.ftpPass,
                        ftpPort: this.state.ftpPort,
                        ftpTested: true,
                        connections: this.state.connections
                    })
                } else if (data.status_code == 1) {
                    this.setState({ statusMessage: 'Username or password is incorrect!' })
                } else {
                    this.setState({ statusMessage: 'Connection Refused, Confirm if FTP Server is active.' })
                }
            })
            .catch(error => {
                this.setState({ statusMessage: 'Please fill out the FTP fields correctly' })
            });
    }

    updateFtpProp(event: any, prop: string) {
        event.preventDefault();
        const configProp = this.state[prop]
        configProp.value = event.target.value
        this.setState({ prop: configProp, ftpTested: false })
    }

    getConnections() {
        const selectDevice = this.state.selectDevice
        selectDevice.loading = true
        this.setState({ connections: [], devices: [], selectDevice: selectDevice })
        fetch('/AndroidFTPBackup/api/get_connections?ip=' + this.props.data.nmapRange.value, { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => {
                const selectDevice = this.state.selectDevice
                selectDevice.loading = false
                this.setState({ connections: data.hosts, selectDevice: selectDevice })
            }).catch((e: any) => {
                const selectDevice = this.state.selectDevice
                selectDevice.loading = false
                this.state._isMounted && this.setState({ selectDevice: selectDevice })
            });
    }

}

export default BackupFtpDetails;