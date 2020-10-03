import * as React from 'react';


class Backup extends React.Component<{ data: any }, any> {
    ws: WebSocket = new WebSocket('ws://' + window.location.host + '/ws/code/output/');
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            folder_list: [],
            ftp_data: { name: "", pass: "", ip: "", port: "" },
            loading: true,
            validIp: false,
            showPassword: false,
            showBackupButton: false,
            backupStarted: { value: false, state: 'Started' },
            statusMessage: '',
            backupData: [],
        };

        this.togglePassword = this.togglePassword.bind(this)
        this.preventChange = this.preventChange.bind(this)
        this.doFtpTest = this.doFtpTest.bind(this)
        this.fetchFtpData = this.fetchFtpData.bind(this)
        this.startBackup = this.startBackup.bind(this)
        this.cancelBackup = this.cancelBackup.bind(this)
        this.handleScroll = this.handleScroll.bind(this)
        this.handleData = this.handleData.bind(this)
    }

    public componentDidMount() {
        let backupStarted = this.state.backupStarted
        backupStarted.value = this.props.data.backup_started
        this.setState({ backupStarted: backupStarted })

        fetch('/AndroidFTPBackup/api/folder_list')
            .then(response => response.json())
            .then(data => this.setState({ folder_list: data }));

        this.fetchFtpData()

        this.ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            this.handleData(payload);
            this.handleScroll()
        }
    }

    public render() {
        let folders = []
        let backupData = []
        if (this.state.folder_list.length !== 0) {
            folders = this.state.folder_list.folders.map((item: any) => {
                return (
                    <div className="list-group-item" key={item[0]}>
                        {item[2] ? <li className=" fas fa-calendar-alt mr-1" title='Folders with year and month of creation are created for backing up files'></li> : ''}
                        {item[3] ? <li className="fas fa-sitemap mr-1" title='Folders within the selected folders to be backed up as one folder only'></li> : ''}
                        {item[0]}
                    </div>
                )
            });
        }
        if (this.state.backupData.length !== 0) {
            backupData = this.state.backupData.map((folder: any) => {
                const files = Object.entries(folder[1]).map((item: any) => {
                    return (
                        <div className='row ml-2' key={item[0] + item[1].value ? item[1].value : ''}>
                            {item[1].state === "Saved" ? <i className='far fa-check-circle text-success' style={{ marginTop: '0.3%' }}></i> : ''}
                            {item[1].state === "Copying" ? <i className='fas fa-sync-alt fa-cool fast-spin h-100' style={{ marginTop: '0.3%' }}></i> : ''}
                            {item[1].state === "Error" ? <i className='far fa-times-circle text-danger' style={{ marginTop: '0.3%' }}></i> : ''}
                            <span className={'ml-2 ' + (item[1].state === "Saved" ? 'text-success' : (item[1].state === "Copying" ? 'text-dark' : 'tex-danger'))}>{item[1].state}:</span>
                            <span className='text-primary ml-2'>{item[1].value}</span>
                            <span className='ml-1'>to</span>
                            <span className='ml-1 text-secondary'>{item[1].target}</span>
                        </div>
                    )
                })
                return (
                    <div style={{ width: '98%' }} key={folder[0]}>
                        {folder[0] === "Completed" || folder[0] === "Cancelled" ?
                            <div className='row'>
                                <div className='col-md-10'>
                                    <h5 className={'ml-2 ' + (folder[0] === "Completed" ? 'text-success' : 'text-danger')}>
                                        <i className={'far' + (folder[0] === "Completed" ? ' text-success fa-check-circle' : ' text-danger far fa-times-circle')} style={{ marginTop: '0.3%' }} />
                                        <span className='ml-2'>Backup {folder[0]} </span>
                                        <span className='text-dark'>{folder[0] === "Completed" ? ' on ' + folder[1].value : ''}</span>
                                    </h5>
                                </div>
                                <div className='col-md-2'>
                                    <button className='btn btn-success w-100' onClick={() => window.location.reload()}>Reload</button>
                                </div>
                            </div>
                            :
                            <>
                                <b>{folder[0]}</b>
                                <hr />
                                {files}
                                <hr />
                            </>
                        }
                    </div>
                )
            })
        }
        return (
            <div className="div-container">
                <div className="row">
                    <div className="col-md-3">
                        <h3>Backup Folders</h3>
                        <div className="list-group list-group-flush">
                            {folders}
                        </div>
                    </div>
                    <div className="col-md-9">
                        {this.state.backupStarted.value ?
                            <>
                                <div className='row'>
                                    <div className="col-md-10">
                                        <h3>Backup {this.state.backupStarted.state}</h3>
                                    </div>
                                    {this.state.backupStarted.state === 'Started' ?
                                        <div className="col-md-2">
                                            <button className="btn btn-danger w-100" onClick={this.cancelBackup}>Cancel</button>
                                        </div>
                                        :
                                        <></>
                                    }
                                </div>
                                <hr />
                                <div style={{ maxHeight: '70vh', overflow: 'auto' }} id='backupDataDiv'>
                                    {backupData}
                                </div>
                            </> 
                            :
                            <>
                                <h3>Backup Now</h3>
                                <div className="form-row" hidden={this.state.backupStarted.value}>
                                    <div className="form-group col-md-3">
                                        <label htmlFor="ftp-ip" id="label-ftp-ip">FTP IP</label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <a href="#" className={"fas fa-sync-alt fa-cool " + (this.state.loading ? 'fast-spin' : '')} id='refresh-wifi-connections'
                                                        title="Refresh Connections" onClick={this.fetchFtpData}></a>
                                                </span>
                                            </div>
                                            <input type="text" className={"form-control" + (this.state.validIp ? '' : ' is-invalid')} id="ftp-ip" placeholder="Loading..."
                                                disabled value={this.state.ftp_data.ip} onChange={this.preventChange} />

                                        </div>
                                        <div className="invalid-feedback">
                                            Please check if your device is connected to the same network.
                                </div>
                                    </div>

                                    <div className="form-group col-md-3">
                                        <label htmlFor="ftp-user" id="label-ftp-user">FTP Username</label>
                                        <input type="text" className="form-control" placeholder="Loading..." id="ftp-user" disabled value={this.state.ftp_data.name}
                                            onChange={this.preventChange} />
                                    </div>

                                    <div className="form-group col-md-3">
                                        <label htmlFor="ftp-pass" id="label-ftp-pass">FTP Password</label>
                                        <div className="input-group">
                                            <input type={this.state.showPassword ? 'text' : "password"} className="form-control" placeholder="Loading..." id="ftp-pass" disabled
                                                value={this.state.ftp_data.pass} onChange={this.preventChange} />
                                            <div className="input-group-append">
                                                <span className="input-group-text">
                                                    <a className="fas fa-eye-slash fa-cool" href='#' id="eye-style" onClick={this.togglePassword}></a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group col-md-1">
                                        <label htmlFor="ftp-port" id="label-ftp-port">FTP Port</label>
                                        <input type="text" className="form-control" id="ftp-port" placeholder="Loading..." disabled value={this.state.ftp_data.port}
                                            onChange={this.preventChange} />
                                    </div>

                                    <div className="form-group col-md-2">
                                        <label htmlFor="ftp-test" id="label-ftp-test">Test Connection</label>
                                        <button type="button" className="btn btn-success w-100" id="ftp-test" aria-roledescription="aria-test"
                                            onClick={this.doFtpTest}>Test</button>
                                        <small className='text-danger'>{this.state.statusMessage}</small>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-md-3"></div>
                                    <div id="backup-div" className="col-md-6 w-50" hidden={this.state.showBackupButton ? false : true}>
                                        <label htmlFor="ftp-backup" id="label-ftp-backup">Backup</label>
                                        <button type="button" className="btn btn-dark w-100" id="ftp-backup" onClick={this.startBackup}>Backup now</button>
                                    </div>
                                    <div className="col-md-3"></div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
        )
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.ws.close();
        this.controller.abort()
    }

    handleScroll() {
        const div = document.getElementById('backupDataDiv')
        if (div !== null && div.scrollTop + 1000 > div.scrollHeight) {
            div.scrollTop = div.scrollHeight
        }
    }

    startBackup() {
        fetch('/AndroidFTPBackup/api/start_backup?backup_name=' + this.props.data.backup_name)
        let backupStarted = this.state.backupStarted
        backupStarted.value = true
        this.setState({ backupStarted: backupStarted })
    }

    cancelBackup() {
        fetch('/AndroidFTPBackup/api/cancel_backup?backup_name=' + this.props.data.backup_name)
        let backupStarted = this.state.backupStarted
        backupStarted.value = true
        backupStarted.state = 'Cancelled'
        this.setState({ backupStarted: backupStarted })
    }

    handleData(data: any) {
        if (this.props.data.backup_name !== data.backup_name) {
            return
        }

        let backupStarted = this.state.backupStarted
        let backupData = this.state.backupData
        if (backupData.length === 0 && data.state !== "Enter Directory") {
            backupData.push(['Backing up', {}])
        }
        if (data.state === "Enter Directory") {
            backupData.push([data.value, {}])
        } else if (data.state === "Copying") {
            backupData[backupData.length - 1][1][data.id] = {
                state: data.state,
                value: data.value,
                target: data.target,
            }
        } else if (data.state === "Saved") {
            backupData[backupData.length - 1][1][data.id].state = 'Saved'
        } else if (data.state === "Error") {
            backupData[backupData.length - 1][1][data.id].state = 'Error'
        } else {
            backupData.push([data.state, {}])
            if (data.state === "Completed") {
                backupStarted.state = 'Completed'
                backupData[backupData.length - 1][1].value = data.value
            }
        }
        this.setState({ backupData: backupData, backupStarted: backupStarted })
    }

    togglePassword() {
        this.setState({ showPassword: !this.state.showPassword })
    }

    fetchFtpData() {
        this.setState({ loading: true, validIp: false })
        fetch('/AndroidFTPBackup/api/ftp_data?data=', { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => {
                let valid = false;
                if (data.ip !== 'Not Found') {
                    valid = true;
                }
                this.setState({ ftp_data: data, loading: false, validIp: valid })
            }).catch();
    }

    doFtpTest() {
        if (!this.state.validIp) {
            return
        }
        const csrftoken = this.getCookie('csrftoken');
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('X-CSRFToken', csrftoken);
        requestHeaders.set('Content-Type', 'application/json');

        fetch('/AndroidFTPBackup/api/test_connections', {
            method: 'POST',
            body: JSON.stringify(this.state.ftp_data),
            headers: requestHeaders,
            signal: this.controller.signal
        })
            .then(response => response.json())
            .then(data => {
                if (data.status_code == 0) {
                    this.setState({ showBackupButton: true, statusMessage: '' })
                } else if (data.status_code == 0) {
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

    preventChange(event: any) {
        event.preventDefault()
        return
    }
}

export default Backup;
