import { Box, Button, Divider, ToggleButton, Tooltip, Typography } from '@mui/material';
import BasicConfig from 'src/model/config/BasicConfig';
import FtpConfig from 'src/model/config/FtpConfig';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import WebDirectoryConfig from 'src/model/config/WebDirectoryConfig';
import NameValueText from 'src/utils/NameValueText';
import React from 'react';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';

interface BackupPreviewProps {
    basicConfig: BasicConfig
    ftpConfig: FtpConfig
    directoryConfig: WebDirectoryConfig
    handleBack: () => void
    saveConfig: Function
}

function BackupPreview(props: BackupPreviewProps) {
    const [saving, setSaving] = React.useState(false)

    const save = () => {
        setSaving(true)
        props.saveConfig().finally(() => setSaving(false))
    }

    return (
        <div>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                Preview Backup
            </Typography>
            <Divider className='my-3' />
            <Box style={{ maxHeight: '65vh', overflow: 'overlay', width: '75vw' }}>
                <Typography variant='h6' className='mt-2'>
                    Backup Details
                </Typography>
                <Divider className='my-1' />
                <div className="d-flex mt-3">
                    <NameValueText name='Name' value={props.basicConfig.name} />
                    <Divider orientation='vertical' className='mx-3' sx={{ height: 'auto' }} />
                    <NameValueText name='Location' value={props.basicConfig.location} />
                    <Divider orientation='vertical' className='mx-3' sx={{ height: 'auto' }} />
                    {props.basicConfig.useNmap ?
                        <NameValueText name='Nmap Scan Range' value={props.basicConfig.nmapRange} />
                        :
                        <NameValueText name='Use Nmap' value='No' />
                    }
                </div>
                <Typography variant='h6' className='mt-4'>
                    FTP Details
                </Typography>
                <Divider className='my-1' />
                <div className="d-flex mt-3">
                    <NameValueText name='IP' value={props.ftpConfig.device.ip} />
                    <Divider orientation='vertical' className='mx-3' sx={{ height: 'auto' }} />
                    {props.basicConfig.useNmap &&
                        <NameValueText name='Mac ID' value={props.ftpConfig.device.mac} />
                    }
                    {props.basicConfig.useNmap &&
                        <Divider orientation='vertical' className='mx-3' sx={{ height: 'auto' }} />
                    }
                    <NameValueText name='Username' value={props.ftpConfig.userId} />
                    <Divider orientation='vertical' className='mx-3' sx={{ height: 'auto' }} />
                    <NameValueText name='Password' value={props.ftpConfig.password} />
                    <Divider orientation='vertical' className='mx-3' sx={{ height: 'auto' }} />
                    <NameValueText name='Port' value={props.ftpConfig.port} />
                </div>
                <Typography variant='h6' className='mt-4'>
                    Backup Folders
                </Typography>
                <Divider className='my-1' />
                <div className="mt-3">
                    {Object.entries(props.directoryConfig.dirs)
                        .filter(([name, dir]) => (dir.selected))
                        .map(([name, dir]) => (
                            <div className="d-flex mt-3" key={name}>
                                <Tooltip title={<h6 className='my-1'>Backup files including files in sub-folders to '{dir.path}', will not create sub-folders</h6>}>
                                    <ToggleButton size='small' value='recursive'
                                        selected={dir.recursive} color='primary'>
                                        <AccountTreeIcon />
                                    </ToggleButton>
                                </Tooltip>
                                <Tooltip title={<h6 className='my-1'>Backup files in '{dir.path}' by creating sub-folders for Year/Month</h6>}>
                                    <ToggleButton size='small' value='monthSeparated' className='mx-3'
                                        color='primary' selected={dir.monthSeparated}>
                                        <EventAvailableIcon />
                                    </ToggleButton>
                                </Tooltip>
                                <NameValueText name={dir.path} value={dir.backupLocation} divProps={{ className: 'py-1' }} />
                            </div>
                        ))}
                </div>
            </Box>
            <div className='mt-4 d-flex justify-content-between'>
                {saving ?
                    <Button color='primary' variant='outlined'>
                        <LoopRoundedIcon className='App-logo mr-2' />
                        Saving
                    </Button>
                    :
                    <Button variant="contained" color="primary" onClick={save}>
                        Save Config
                    </Button>
                }
                <Button onClick={props.handleBack} color="error" variant="outlined" >
                    Back
                </Button>
            </div>
        </div>
    )
}

export default BackupPreview;