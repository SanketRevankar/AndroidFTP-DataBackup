import { Button, TextField, Typography } from '@material-ui/core';
import * as React from 'react';
import LoopRoundedIcon from '@material-ui/icons/LoopRounded';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';

class BackupForm extends React.Component<{ data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            ftpIp: this.props.data.ftpConfig.selectDevice.value,
            latestIp: false,
            loading: false,
            statusMessage: ''
        }

        this.doFtpTest = this.doFtpTest.bind(this)
        this.reloadIp = this.reloadIp.bind(this)
    }

    componentDidMount() {
        this.setState({ _isMounted: true })
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.controller.abort()
    }

    static getDerivedStateFromProps(props: any, state: any) {
        if (!state.latestIp && props.data.ftpConfig.selectDevice.value !== state.ftpIp) {
            return {
                ftpIp: props.data.ftpConfig.selectDevice.value,
            }
        }

        return null
    }


    render() {
        return (
            <div className='mt-3'>
                <Button
                    color='primary'
                    variant='contained'
                    onClick={this.reloadIp}
                >
                    <LoopRoundedIcon
                        className={(this.state.loading ? 'fast-spin' : '') + ' mr-2'}
                    />
                    Fetch Latest Ip
                </Button>

                <div>
                    <TextField
                        label='FTP IP'
                        variant="outlined"
                        color='secondary'
                        className='mt-4'
                        value={this.state.ftpIp}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </div>

                <div>
                    <TextField
                        label='FTP Username'
                        variant="outlined"
                        color='secondary'
                        className='mt-3'
                        value={this.props.data.ftpConfig.ftpUser.value}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </div>

                <div>
                    <TextField
                        label='FTP Password'
                        variant="outlined"
                        color='secondary'
                        className='mt-3'
                        value={this.props.data.ftpConfig.ftpPass.value}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </div>

                <div>
                    <TextField
                        label='FTP Port'
                        variant="outlined"
                        color='secondary'
                        className='mt-3'
                        value={this.props.data.ftpConfig.ftpPort.value}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </div>

                <Typography color='secondary' className='mt-3'>{this.state.statusMessage}</Typography>

                <div>
                    <Button
                        color='primary'
                        variant='contained'
                        className='mt-3 mr-3'
                        onClick={this.doFtpTest}
                    >
                        <PlaylistAddCheckIcon className='mr-2' />
                        Test
                    </Button>
                </div>
            </div>
        )
    }

    reloadIp() {
        this.setState({ loading: true })
        fetch('/AndroidFTPBackup/api/ftp_data')
            .then(response => response.json())
            .then(data => {
                if (data.ip != 'Not Found') {
                    this.setState({ ftpIp: data.ip, latestIp: true, loading: false })
                }
            })
    }

    doFtpTest() {
        this.setState({ statusMessage: 'Testing FTP connection, Please wait...' })
        const csrftoken = this.getCookie('csrftoken');
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('X-CSRFToken', csrftoken);
        requestHeaders.set('Content-Type', 'application/json');

        fetch('/AndroidFTPBackup/api/test_connections', {
            method: 'POST',
            body: JSON.stringify({
                ip: this.state.ftpIp,
                name: this.props.data.ftpConfig.ftpUser.value,
                pass: this.props.data.ftpConfig.ftpPass.value,
                port: this.props.data.ftpConfig.ftpPort.value,
            }),
            headers: requestHeaders,
            signal: this.controller.signal
        })
            .then(response => response.json())
            .then(data => {
                if (data.status_code == 0) {
                    this.setState({ statusMessage: '' })
                    this.props.data.handleNext()
                } else if (data.status_code == 1) {
                    this.setState({ statusMessage: 'Username or password is incorrect!' })
                } else {
                    this.setState({ statusMessage: 'Connection Refused, Confirm if FTP Server is active.' })
                }
            });
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

}

export default BackupForm;
