import * as React from 'react';
import DirList from './DirList';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class BackupConfig extends React.Component<{ data: any }, any> {
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            connections: [],
            devices: [],
            statusMessage: '',
            connectionsLoaded: false,
            showPassword: false,
            ftpTested: false,
            selectDevice: {
                class: '',
                value: 'Loading...',
                macId: '',
                spin: true,
                defaultValue: 'Loading...',
                disabled: false
            },
            backupName: {
                class: '',
                value: '',
            },
            backupLocation: {
                class: '',
                value: '',
            },
            nmapRange: {
                class: 'is-valid',
                value: this.props.data.context.hosts,
            },
            ftpUser: {
                class: '',
                value: '',
                disabled: false
            },
            ftpPass: {
                class: '',
                value: '',
                disabled: false
            },
            ftpPort: {
                class: '',
                value: '',
                disabled: false
            },
            foldersClass: '',
            dir_list: {},
            newDirList: null,
            modalShow: false,
            backupClass: '',
            initialLoad: false,
            loadExisting: false,
            ConfigDirList: null,
        };

        this.deviceSelect = this.deviceSelect.bind(this)
        this.getConnections = this.getConnections.bind(this)
        this.validateBackupName = this.validateBackupName.bind(this)
        this.validateBackupLocation = this.validateBackupLocation.bind(this)
        this.changeBackupLocation = this.changeBackupLocation.bind(this)
        this.validateNmapRange = this.validateNmapRange.bind(this)
        this.changeNmapRange = this.changeNmapRange.bind(this)
        this.changeFtpUser = this.changeFtpUser.bind(this)
        this.changeFtpPass = this.changeFtpPass.bind(this)
        this.changeFtpPort = this.changeFtpPort.bind(this)
        this.toglePassword = this.toglePassword.bind(this)
        this.validateInput = this.validateInput.bind(this)
        this.doFtpTest = this.doFtpTest.bind(this)
        this.clickCheckbox = this.clickCheckbox.bind(this)
        this.clickRadio = this.clickRadio.bind(this)
        this.handleConfirm = this.handleConfirm.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.loadExisting = this.loadExisting.bind(this)
        this.clearForm = this.clearForm.bind(this)
    }

    public componentDidMount() {
        if (this.props.data.context.loadExisting) {
            this.loadExisting()
        } else {
            this.setState({ initialLoad: true })
        }
        this.getConnections(null);
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.controller.abort()
    }

    componentDidUpdate(nextProps: any) {
        if (nextProps.data.context.loadExisting === true && !this.state.loadExisting) {
            this.loadExisting()
        }
        if (!nextProps.data.context.loadExisting === true && this.state.loadExisting) {
            this.clearForm()
        }
    }

    public render() {
        if (!this.state.initialLoad) {
            return ''
        }
        const dirListData = {
            dir_list: this.state.dir_list,
            clickCheckbox: this.clickCheckbox,
            clickRadio: this.clickRadio,
        }
        let backupFolderData = ''
        if (this.state.newDirList !== null) {
            backupFolderData = this.state.newDirList.map((item: any) => {
                return (
                    <React.Fragment key={item[0]}>
                        <br />
                        {item[0]}
                        {item[1].split_by_year_month ?
                            <>
                                <i>&nbsp;-&nbsp;</i>
                                <i className="fas fa-calendar-alt" title="Folders with year and month of creation will created for backing up this folder"></i>
                            </>
                            :
                            ''
                        }
                        {item[1].all_in_one ?
                            <>
                                <i>&nbsp;-&nbsp;</i>
                                <i className="fas fa-sitemap" title="Folders within this folders will be backed up"></i>
                            </>
                            :
                            ''
                        }
                    </React.Fragment>
                )
            })
        }
        return (
            <div className="container mt-5 mb-5">
                <form id="user-config" onSubmit={this.validateInput}>
                    <h2 className="bg-dark">Create a new Backup</h2>

                    <div className="form-group">
                        <label htmlFor="backup-location" id="label-backup-name">Backup Name</label>
                        <input type="text" className={"form-control " + this.state.backupName.class} aria-roledescription="backup-help" id="backup-name" placeholder="Enter Backup Name"
                            value={this.state.backupName.value} onChange={this.validateBackupName} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="backup-location" id="label-backup-location">Backup Location</label>
                        <input type="text" className={"form-control " + this.state.backupLocation.class} aria-roledescription="backup-help" id="backup-location" placeholder="Enter Backup Location"
                            value={this.state.backupLocation.value} onBlur={this.validateBackupLocation} onChange={this.changeBackupLocation} />
                        <small id="backup-help" className="form-text text-muted">Reconfirm the Location to avoid errors.</small>
                        <div className="invalid-feedback">
                            Please give a backup location. (PS. Cannot save in Drive directly, enter a folder name)
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nmap-range" id="label-nmap-range">Local IP range for Nmap Scan</label>
                        <input type="text" className={"form-control " + this.state.nmapRange.class} aria-roledescription="nmap-help" id="nmap-range" placeholder="Enter IP Range"
                            value={this.state.nmapRange.value} onBlur={this.validateNmapRange} onChange={this.changeNmapRange} />
                        <small id="nmap-help" className="form-text text-muted">Use CIDR Notation, given IP range is default for most cases.</small>
                        <div className="invalid-feedback">
                            Please enter a valid IP range.
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="wifi-connections" id="label-wifi-connections">Select your Device</label>
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">
                                    <a href="#" className={"fas fa-sync-alt fa-cool" + (this.state.selectDevice.spin ? ' fast-spin' : '')} id='refresh-wifi-connections'
                                        title="Refresh Connections" onClick={this.getConnections} ></a>
                                </span>
                            </div>
                            <select id="wifi-connections" aria-roledescription="wifi-help" onChange={this.deviceSelect} disabled={this.state.selectDevice.disabled ? true : false}
                                className={"form-control custom-select " + this.state.selectDevice.class}>
                                <option>{this.state.selectDevice.defaultValue}</option>
                                {this.state.devices}
                            </select>
                        </div>
                        <small id="wifi-help" className="form-text text-muted">Using Nmap to scan on <a id="nmap-ip"></a></small>
                        <div className="invalid-feedback">
                            Please Choose your device.
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group col-md-3">
                            <label htmlFor="ftp-ip" id="label-ftp-ip">FTP IP</label>
                            <input type="text" className="form-control" aria-roledescription="ftp-ip-help" id="ftp-ip" placeholder="Select your device for IP" disabled={true}
                                value={this.state.selectDevice.value} />
                            <small id="ftp-ip-help" className="form-text text-muted">IP of your Device.</small>
                            <div className="invalid-feedback">
                                Please select device from above.
                            </div>
                        </div>

                        <div className="form-group col-md-3">
                            <label htmlFor="ftp-user" id="label-ftp-user">FTP Username</label>
                            <input type="text" className="form-control" aria-roledescription="ftp-user-help" id="ftp-user" placeholder="Enter FTP Username"
                                disabled={this.state.ftpUser.disabled ? true : false} value={this.state.ftpUser.value} onChange={this.changeFtpUser} />
                            <small id="ftp-user-help" className="form-text text-muted">Enter FTP Username.</small>
                            <div className="invalid-feedback">
                                Please enter correct username.
                            </div>
                        </div>

                        <div className="form-group col-md-3">
                            <label htmlFor="ftp-pass" id="label-ftp-pass">FTP Password</label>
                            <input className="form-control" id="ftp-pass-hidden" hidden />
                            <div className="input-group">
                                <input type={this.state.showPassword ? 'text' : "password"} className="form-control" aria-roledescription="ftp-pass-help" id="ftp-pass"
                                    placeholder="Enter FTP Password"
                                    disabled={this.state.ftpPass.disabled ? true : false} value={this.state.ftpPass.value} onChange={this.changeFtpPass} />
                                <div className="input-group-append">
                                    <span className="input-group-text">
                                        <a className={"fas fa-cool " + (this.state.showPassword ? 'fa-eye-slash' : "fa-eye")} href='#' id="eye-style" onClick={this.toglePassword}></a>
                                    </span>
                                </div>
                            </div>
                            <small id="ftp-pass-help" className="form-text text-muted">Enter FTP Password.</small>
                            <div className="invalid-feedback">
                                Please enter correct password.
                            </div>
                        </div>

                        <div className="form-group col-md-1">
                            <label htmlFor="ftp-port" id="label-ftp-port">FTP Port</label>
                            <input type="text" className="form-control" aria-roledescription="ftp-port-help" id="ftp-port" placeholder="FTP Port"
                                disabled={this.state.ftpPort.disabled ? true : false} value={this.state.ftpPort.value} onChange={this.changeFtpPort} />
                            <small id="ftp-port-help" className="form-text text-muted">Enter FTP Port.</small>
                            <div className="invalid-feedback">
                                Please enter correct port.
                            </div>
                        </div>

                        <div className="form-group col-md-2">
                            <label htmlFor="ftp-test" id="label-ftp-test">FTP Test</label>
                            <input className="form-control" id="ftp-test-hidden" hidden />
                            <button type="button" className="btn btn-success w-100" id="ftp-test" aria-roledescription="ftp-test-help" onClick={this.doFtpTest}
                                disabled={this.state.ftpTested ? true : false}>FTP Test</button>
                            <small id="ftp-test-help" className="form-text text-danger">{this.state.statusMessage}</small>
                            <div className="invalid-feedback">
                                Please test before submitting.
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="file-list-div" id="label-file-list-div" aria-roledescription="ftp-dir-help">Folders to Backup</label>
                        <input className={"form-control " + this.state.foldersClass} id="ftp-list-hidden" hidden />
                        <small id="ftp-dir-help" className="form-text text-muted">Will be loaded on successful test.</small>
                        <div className="invalid-feedback">
                            Please select atleast one folder to backup.
                        </div>
                    </div>

                    <DirList data={dirListData} />

                    <div className="form-group">
                        <input className={"form-control " + this.state.backupClass} hidden />
                        <div className="invalid-feedback">
                            Saving config failed, Please retry.
                        </div>
                    </div>

                    <button type="submit" className="btn btn-dark w-100">Submit</button>

                    <Modal show={this.state.modalShow} onHide={this.handleClose} backdrop="static" keyboard={false} scrollable={true} >
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Backup Settings</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <i className="text-primary">Backup Name: </i>{this.state.backupName.value}<br />
                            <i className="text-primary">Backup Location: </i>{this.state.backupLocation.value}<br />
                            <i className="text-primary">Nmap Range: </i>{this.state.nmapRange.value}<br />
                            <i className="text-primary">FTP IP: </i>{this.state.selectDevice.value}<br />
                            <i className="text-primary">FTP Username: </i>{this.state.ftpUser.value}<br />
                            <i className="text-primary">FTP Password: </i>{this.state.ftpPass.value}<br />
                            <i className="text-primary">FTP Port: </i>{this.state.ftpPort.value}<br />
                            <hr />
                            <i className="text-primary">Backup these folders: </i>
                            {backupFolderData}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.handleClose}>Close</Button>
                            <Button variant="primary" onClick={this.handleConfirm}>Save changes</Button>
                        </Modal.Footer>
                    </Modal>
                </form>

            </div>
        )
    }
    clearForm() {
        const backupName = {
            class: '',
            value: '',
        }
        const backupLocation = {
            class: '',
            value: '',
        }
        const ftpUser = {
            class: '',
            value: '',
            disabled: false
        }
        const ftpPass = {
            class: '',
            value: '',
            disabled: false
        }
        const ftpPort = {
            class: '',
            value: '',
            disabled: false
        }
        this.setState({
            backupName: backupName, backupLocation: backupLocation, ftpUser: ftpUser,
            loadExisting: false, ftpPass: ftpPass, ftpPort: ftpPort, ConfigDirList: null,
        })
    }

    loadExisting() {
        fetch('/AndroidFTPBackup/api/load_config', { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => {
                if (!data.default) {
                    const backupName = {
                        class: 'is-valid',
                        value: data.config.ID.backup_name,
                    }
                    const backupLocation = {
                        class: 'is-valid',
                        value: data.config.Path.backup_folder,
                    }
                    const ftpUser = {
                        class: 'is-valid',
                        value: data.config.FTP.username,
                        disabled: false
                    }
                    const ftpPass = {
                        class: 'is-valid',
                        value: data.config.FTP.password,
                        disabled: false
                    }
                    const ftpPort = {
                        class: 'is-valid',
                        value: data.config.FTP.port,
                        disabled: false
                    }
                    const selectDevice = {
                        class: 'is-valid',
                        value: data.config.FTP.ftp_ip,
                        macId: data.config.FTP.mac,
                        defaultValue: 'Loading...',
                        spin: true,
                        disabled: false
                    }
                    this.setState({
                        backupName: backupName, backupLocation: backupLocation, ftpUser: ftpUser, loadExisting: true,
                        ftpPass: ftpPass, ftpPort: ftpPort, selectDevice: selectDevice, ConfigDirList: data.config.Path.folders,
                    })
                }
            })
            .then(_ => this.setState({ initialLoad: true }))
            .catch();
    }

    toglePassword(event: any) {
        event.preventDefault();

        this.setState({ showPassword: !this.state.showPassword })
    }

    deviceSelect(event: any) {
        event.preventDefault();
        const index = event.nativeEvent.target.selectedIndex;
        const selectDevice = this.state.selectDevice

        if (event.target.value === 'Choose your device') {
            selectDevice.class = 'is-invalid'
            selectDevice.value = ''
        } else {
            selectDevice.class = 'is-valid'
            selectDevice.macId = event.nativeEvent.target[index].getAttribute('data-name')
            selectDevice.value = event.target.value
        }
        this.setState({ selectDevice: selectDevice })
    }

    validateBackupName(event: any) {
        event.preventDefault();
        const backupName = this.state.backupName
        backupName.value = event.target.value

        if (event.target.value.length === 0) {
            backupName.class = 'is-invalid'
        } else {
            backupName.class = 'is-valid'
        }
        this.setState({ backupName: backupName })
    }

    changeBackupLocation(event: any) {
        event.preventDefault();
        const backupLocation = this.state.backupLocation
        backupLocation.value = event.target.value
        this.setState({ backupLocation: backupLocation })
    }

    changeNmapRange(event: any) {
        event.preventDefault();
        const nmapRange = this.state.nmapRange
        nmapRange.value = event.target.value
        this.setState({ nmapRange: nmapRange })
    }

    changeFtpUser(event: any) {
        event.preventDefault();
        const ftpUser = this.state.ftpUser
        ftpUser.value = event.target.value
        this.setState({ ftpUser: ftpUser })
    }

    changeFtpPass(event: any) {
        event.preventDefault();
        const ftpPass = this.state.ftpPass
        ftpPass.value = event.target.value
        this.setState({ ftpPass: ftpPass })
    }

    changeFtpPort(event: any) {
        event.preventDefault();
        const ftpPort = this.state.ftpPort
        ftpPort.value = event.target.value
        this.setState({ ftpPort: ftpPort })
    }

    validateBackupLocation(event: any) {
        event.preventDefault();
        const backupLocation = this.state.backupLocation
        if (!event.target.value.match('^[a-zA-Z]:\\/\\w(\\w+\\/)*\\w*$')) {
            backupLocation.class = 'is-invalid'
        } else {
            backupLocation.class = 'is-valid'
        }
        this.setState({ backupLocation: backupLocation })
    }

    validateNmapRange(event: any) {
        event.preventDefault();
        const nmapRange = this.state.nmapRange
        if (!event.target.value.match('^([0-9]{1,3}\\.){3}[0-9]{1,3}(\\/([0-9]|[1-2][0-9]|3[0-2]))?$')) {
            nmapRange.class = 'is-invalid'
        } else {
            nmapRange.class = 'is-valid'
        }
        this.setState({ nmapRange: nmapRange })
    }

    getConnections(event: any) {
        if (event !== null) {
            event.preventDefault();
        }

        if (this.state.selectDevice.disabled) {
            return
        }

        const selectDevice = {
            class: false,
            defaultValue: 'Loading...',
            value: '',
            spin: true,
        }
        this.setState({ connections: [], connectionsLoaded: false, devices: [], selectDevice: selectDevice })
        fetch('/AndroidFTPBackup/api/get_connections?ip=' + this.props.data.context.hosts, { signal: this.controller.signal })
            .then(response => response.json())
            .then(data => {
                const devices = data.hosts.map((device: any) => {
                    return (
                        <option key={device.ip} value={device.ip} data-name={device.mac}>{device.ip} - {device.vendor} - {device.mac}</option>
                    )
                })
                const selectDevice = this.state.selectDevice
                selectDevice['defaultValue'] = 'Choose your device'
                selectDevice['spin'] = false
                this.setState({ connections: data.hosts, connectionsLoaded: true, devices: devices, selectDevice: selectDevice })
            }).catch((e: any) => {
                const selectDevice = this.state.selectDevice
                selectDevice['spin'] = false
                this.state._isMounted && this.setState({ selectDevice: selectDevice })
            });
    }

    doFtpTest(event: any) {
        event.preventDefault();
        const ftp_data = {
            ip: this.state.selectDevice.value,
            name: this.state.ftpUser.value,
            pass: this.state.ftpPass.value,
            port: this.state.ftpPort.value,
        }

        const csrftoken = this.getCookie('csrftoken');
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('X-CSRFToken', csrftoken);
        requestHeaders.set('Content-Type', 'application/json');

        fetch('/AndroidFTPBackup/api/get_dir_list', {
            method: 'POST',
            body: JSON.stringify(ftp_data),
            headers: requestHeaders,
            signal: this.controller.signal
        })
            .then(response => response.json())
            .then(data => {
                if (data.status_code == 0) {
                    const ftpUser = this.state.ftpUser
                    ftpUser.disabled = true
                    const ftpPass = this.state.ftpPass
                    ftpPass.disabled = true
                    const ftpPort = this.state.ftpPort
                    ftpPort.disabled = true
                    const selectDevice = this.state.selectDevice
                    selectDevice.disabled = true

                    if (this.state.ConfigDirList !== null) {
                        this.state.ConfigDirList.map((item: any) => {
                            data.dir_list[item[0]] = {
                                all_in_one: item[3],
                                checked: true,
                                split_by_year_month: item[2],
                            }
                        })
                    }

                    this.setState({
                        ftpTested: true, statusMessage: '', ftpUser: ftpUser, ftpPass: ftpPass,
                        ftpPort: ftpPort, selectDevice: selectDevice, dir_list: data.dir_list
                    })
                } else if (data.status_code == 0) {
                    this.setState({ statusMessage: 'Username or password is incorrect!' })
                } else {
                    this.setState({ statusMessage: 'Connection Refused, Confirm if FTP Server is active.' })
                }
            })
            .catch(error => {
                this.setState({ statusMessage: 'Please fill out the FTP fields correctly' })
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

    validateInput(event: any) {
        event.preventDefault();
        let validationFailed = false;

        let selectDevice = this.state.selectDevice
        let backupName = this.state.backupName
        let backupLocation = this.state.backupLocation
        let nmapRange = this.state.nmapRange
        let statusMessage = this.state.statusMessage
        let foldersClass = ''
        let modalShow = this.state.modalShow

        if (this.state.selectDevice.class !== 'is-valid') {
            selectDevice.class = 'is-invalid'
            validationFailed = true
        }
        if (this.state.backupName.class !== 'is-valid') {
            backupName.class = 'is-invalid'
            validationFailed = true
        }
        if (this.state.backupLocation.class !== 'is-valid') {
            backupLocation.class = 'is-invalid'
            validationFailed = true
        }
        if (this.state.nmapRange.class !== 'is-valid') {
            nmapRange.class = 'is-invalid'
            validationFailed = true
        }
        if (!this.state.ftpTested) {
            statusMessage = 'Please test before submitting.'
            validationFailed = true
        }

        const newDirList = Object.entries(this.state.dir_list).filter((item: any) => {
            return item[1].checked
        })

        if (newDirList.length === 0) {
            foldersClass = 'is-invalid'
            validationFailed = true
        }

        if (!validationFailed) {
            modalShow = true
        }

        this.setState({
            selectDevice: selectDevice, backupName: backupName,
            backupLocation: backupLocation, nmapRange: nmapRange,
            statusMessage: statusMessage, foldersClass: foldersClass,
            newDirList: newDirList, modalShow: modalShow
        })

        return !validationFailed
    }

    clickCheckbox(event: any) {
        const dir_list = this.state.dir_list
        dir_list[event.target.id].checked = !dir_list[event.target.id].checked
        this.setState({ dir_list: dir_list })
    }

    clickRadio(event: any) {
        const data = event.target.id.split('-')
        const dir_list = this.state.dir_list
        dir_list[data[0]][data[1]] = !dir_list[data[0]][data[1]]
        this.setState({ dir_list: dir_list })
    }

    handleClose(event: any) {
        event.preventDefault();

        this.setState({ modalShow: false })
    }

    handleConfirm() {
        const configData = {
            ip: this.state.selectDevice.value,
            name: this.state.ftpUser.value,
            pass: this.state.ftpPass.value,
            port: this.state.ftpPort.value,
            backup_name: this.state.backupName.value,
            backup_location: this.state.backupLocation.value,
            nmap_range: this.state.nmapRange.value,
            dir_list: this.state.newDirList,
            mac: this.state.selectDevice.macId
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
        }).then(response => response.json())
            .then(data => {
                this.props.data.loadBackupPage(this.state.backupName.value)
            })
            .catch(error => {
                this.setState({ backupClass: 'is-invalid', modalShow: false })
            })
    }
}

export default BackupConfig;

