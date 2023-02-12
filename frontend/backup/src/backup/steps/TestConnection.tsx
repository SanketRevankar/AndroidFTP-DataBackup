import * as React from 'react';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import FtpConfig from 'src/model/config/FtpConfig';
import FtpService from 'src/service/FtpService';
import NameValueText from 'src/utils/NameValueText';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import WifiFindIcon from '@mui/icons-material/WifiFind';

interface TestConnectionProps {
    ftpConfig: FtpConfig
    nmapRange: string
    updateCurrentIp: Function
    useNmap: boolean
}

export default function TestConnection(props: TestConnectionProps) {
    const [controller] = React.useState(new AbortController())
    const [loading, setLoading] = React.useState(false)
    const [testing, setTesting] = React.useState(false)
    const [statusMessage, setStatusMessage] = React.useState('')
    const [ftpIp, setFtpIp] = React.useState(props.ftpConfig.device.ip)

    React.useEffect(() => () => {
        controller.abort()
    }, [controller])

    const reloadIp = () => {
        setLoading(true)
        FtpService().refreshIp(props.nmapRange, props.ftpConfig.device.mac, controller)
            .then(data => {
                if (data.ip !== 'Not Found') {
                    setFtpIp(data.ip)
                } else {
                    setStatusMessage('Device not found, make sure it is connected to WiFi.')
                }
            })
            .finally(() => setLoading(false))
    }

    const doFtpTest = () => {
        setStatusMessage('Testing FTP connection, Please wait...')
        setTesting(true)

        const ftpData = {
            ip: ftpIp, userId: props.ftpConfig.userId,
            password: props.ftpConfig.password, port: props.ftpConfig.port
        }
        FtpService().testFtp(ftpData, controller)
            .then(data => {
                if (data.status_code === 0) {
                    setStatusMessage('')
                    props.updateCurrentIp(ftpIp)
                } else if (data.status_code === 1) {
                    setStatusMessage('Username or password is incorrect!')
                } else {
                    setStatusMessage('Connection Refused, Confirm if FTP Server is active.')
                }
            })
            .finally(() => setTesting(false))
    }

    const refreshButton = props.useNmap && <Tooltip title='Fetch Latest Ip'>
        <IconButton color='primary' onClick={reloadIp}>
            <LoopRoundedIcon className={(loading ? 'App-logo' : '')} />
        </IconButton>
    </Tooltip>

    return (
        <Box>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                Test FTP Connection
            </Typography>
            <Divider className='my-3' />
            <Box style={{ maxHeight: '65vh', overflow: 'overlay', width: '75vw' }}>
                <div style={{ width: '15vw' }}>
                    {props.useNmap ?
                        <NameValueText
                            name='Device IP' value={props.ftpConfig.device.ip}
                            valueProps={{ variant: 'subtitle1' }} endIcon={refreshButton}
                            divProps={{ className: 'd-flex align-items-center justify-content-between' }}
                        />
                        :
                        <TextField
                            label="FTP IP" variant="filled" className='mt-3 mb-2' fullWidth
                            value={ftpIp} onChange={(event) => setFtpIp(event.target.value)}
                        />
                    }
                    {props.useNmap &&
                        <NameValueText name='Mac ID' value={props.ftpConfig.device.mac}
                            valueProps={{ variant: 'subtitle1' }} divProps={{ className: 'mt-3' }} />
                    }
                    <NameValueText name='Username' value={props.ftpConfig.userId}
                        valueProps={{ variant: 'subtitle1' }} divProps={{ className: 'mt-3' }} />
                    <NameValueText name='Password' value={props.ftpConfig.password}
                        valueProps={{ variant: 'subtitle1' }} divProps={{ className: 'mt-3' }} />
                    <NameValueText name='Port' value={props.ftpConfig.port}
                        valueProps={{ variant: 'subtitle1' }} divProps={{ className: 'mt-3' }} />
                </div>
            </Box>
            <Typography color='text.secondary' className='my-4'>{statusMessage}</Typography>
            {testing ?
                <Button color='primary' variant='outlined'>
                    <LoopRoundedIcon className='App-logo mr-2' />
                    Testing
                </Button>
                :
                <Button color='primary' variant='contained' onClick={doFtpTest} >
                    <WifiFindIcon className='mr-2' />
                    Test
                </Button>
            }
        </Box>
    )
}
