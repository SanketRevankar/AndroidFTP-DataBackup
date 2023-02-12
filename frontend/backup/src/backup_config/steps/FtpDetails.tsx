import { TextField, MenuItem, Typography, Button, IconButton, Divider, Box } from '@mui/material';
import * as React from 'react';
import FtpConfig from 'src/model/config/FtpConfig';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import DeviceData from 'src/model/DeviceData';
import WiFiService from 'src/service/WiFiService';
import FtpService from 'src/service/FtpService';

interface FtpDetailsProps {
    ftpConfig: FtpConfig
    useNmap: boolean
    nmapRange: any
    setFtpConfig: React.Dispatch<React.SetStateAction<FtpConfig>>
    handleBack: () => void
    handleNext: () => void
}

function FtpDetails(props: FtpDetailsProps) {
    const [selectedDevice, setSelectedDevice] = React.useState<DeviceData>(props.ftpConfig.device)
    const [ftpUser, setFtpUser] = React.useState(props.ftpConfig.userId)
    const [ftpPass, setFtpPass] = React.useState(props.ftpConfig.password)
    const [ftpPort, setFtpPort] = React.useState(props.ftpConfig.port)
    const [loading, setLoading] = React.useState(false)
    const [ftpTested, setFtpTested] = React.useState(false)
    const [devices, setDevices] = React.useState<DeviceData[]>([])
    const [statusMessage, setStatusMessage] = React.useState('')
    const [selected, setSelected] = React.useState('default_')
    const [controller] = React.useState(new AbortController())

    const getConnections = React.useCallback(() => {
        setLoading(true)
        WiFiService().getConnectedDevices(props.nmapRange, controller)
            .then(data => setDevices(data.devices))
            .finally(() => setLoading(false))
    }, [controller, props.nmapRange])

    React.useEffect(() => {
        setSelectedDevice(props.ftpConfig.device)
        setFtpUser(props.ftpConfig.userId)
        setFtpPass(props.ftpConfig.password)
        setFtpPort(props.ftpConfig.port)
    }, [props.ftpConfig])

    React.useEffect(() => {
        if (!ftpTested && props.useNmap) {
            getConnections()
        }
    }, [ftpTested, getConnections, props.useNmap])

    React.useEffect(() => () => {
        controller.abort()
    }, [controller])

    const deviceSelect = (event: any) => {
        const value = event.target.value
        setSelected(value)
        setFtpTested(false)
        const device = event.target.value.split('_')
        setSelectedDevice({ ip: device[0], mac: device[1] })
    }

    const validateFTP = () => {
        if (props.useNmap && selected === 'default_') {
            return false
        } else {
            return testFTP()
        }
    }

    const saveConfigAndNext = () => {
        const ftpConfig: FtpConfig = {
            device: selectedDevice, userId: ftpUser,
            password: ftpPass, port: ftpPort
        }
        props.setFtpConfig(ftpConfig)
        props.handleNext()
    }

    const testFTP = () => {
        if (ftpTested) {
            return saveConfigAndNext()
        }

        setStatusMessage('Testing FTP connection, Please wait...')
        const ftp_data = {
            ip: selectedDevice.ip, userId: ftpUser,
            password: ftpPass, port: ftpPort,
        }
        FtpService().testFtp(ftp_data, controller)
            .then(data => {
                if (data.status_code === 0) {
                    setStatusMessage('')
                    setFtpTested(true)
                    saveConfigAndNext()
                } else if (data.status_code === 1) {
                    setStatusMessage('Username or password is incorrect!')
                } else {
                    setStatusMessage('Connection Refused, Confirm if FTP Server is active.')
                }
            })
            .catch(e => {
                console.log(e)
                setStatusMessage('Please fill out the FTP fields correctly')
            })
    }

    return (
        <div>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                FTP Details
            </Typography>
            <Divider className='my-3' />
            <Box style={{ width: '75vw' }}>
                {props.useNmap ?
                    <TextField
                        label='Choose your device' select className='mt-3'
                        value={selected} onChange={(event) => deviceSelect(event)} fullWidth
                        InputProps={{
                            startAdornment: (
                                <IconButton onClick={getConnections}>
                                    <LoopRoundedIcon fontSize='small' className={loading ? 'App-logo' : ''} />
                                </IconButton>
                            )
                        }}
                    >
                        <MenuItem key='default_' value="default_" disabled>
                            {loading ? 'Loading...' : 'Choose your device'}
                        </MenuItem>
                        {devices.map((device) => (
                            <MenuItem key={device.ip} value={device.ip + "_" + device.mac}>
                                MAC: {device.mac} | IP: {device.ip} | Vendor: {device.vendor ? device.vendor : 'Not Known'}
                            </MenuItem>
                        ))}
                    </TextField>
                    :
                    <TextField
                        label="FTP IP" variant="filled" className='mt-3' fullWidth
                        value={selectedDevice.ip} onChange={(event) => { setFtpTested(false); setSelectedDevice({ ip: event.target.value, mac: '' }) }}
                    />
                }
                <TextField
                    label="FTP UserId" variant="filled" className='mt-3' fullWidth
                    value={ftpUser} onChange={(event) => { setFtpTested(false); setFtpUser(event.target.value) }}
                />
                <TextField
                    label="FTP Password" variant="filled" className='mt-3' fullWidth
                    value={ftpPass} onChange={(event) => { setFtpTested(false); setFtpPass(event.target.value) }}
                />
                <TextField
                    label="FTP Port" variant="filled" className='mt-3' fullWidth
                    value={ftpPort} onChange={(event) => { setFtpTested(false); setFtpPort(event.target.value) }}
                />
                <Typography color='text.secondary' className='mt-3'>
                    {statusMessage}
                </Typography>
            </Box>
            <div className='mt-4 d-flex justify-content-between'>
                <Button variant="contained" color="primary" onClick={validateFTP}>
                    Test FTP
                </Button>
                <Button onClick={props.handleBack} color="error" variant="outlined" >
                    Back
                </Button>
            </div>
        </div>
    )
}

export default FtpDetails;