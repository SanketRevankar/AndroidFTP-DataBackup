import * as React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { TextField, Button, InputAdornment, Divider, Typography, Box, Tooltip, ToggleButton } from '@mui/material';
import BasicConfig from 'src/model/config/BasicConfig';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';

interface BackupDetailsProps {
    basicConfig: BasicConfig
    mode: any
    setBasicConfig: React.Dispatch<React.SetStateAction<BasicConfig>>
    handleNext: Function
}

export default function BackupDetails(props: BackupDetailsProps) {
    const folderLocationRegex = '^[a-zA-Z]:\\/\\w(\\w*\\/)*\\w*$'
    const nmapRangeRegex = '^([0-9]{1,3}\\.){3}[0-9]{1,3}(\\/([0-9]|[1-2][0-9]|3[0-2]))?$'
    const [backupName, setBackupName] = React.useState(props.basicConfig.name)
    const [backupLocation, setBackupLocation] = React.useState(props.basicConfig.location)
    const [nmapRange, setNmapRange] = React.useState(props.basicConfig.nmapRange)
    const [useNmap, setUseNmap] = React.useState(props.basicConfig.useNmap)

    React.useEffect(() => {
        setBackupName(props.basicConfig.name)
        setBackupLocation(props.basicConfig.location)
        setNmapRange(props.basicConfig.nmapRange)
        setUseNmap(props.basicConfig.useNmap)
    }, [props.basicConfig])

    const validateBackupName = () => {
        if (props.mode === 'edit') return true
        return backupName.length !== 0
    }

    const validateBackupLocation = () => Boolean(backupLocation.match(folderLocationRegex))
    const validateNmapRange = () => Boolean(nmapRange.match(nmapRangeRegex))

    const getInputProps = (valid: boolean | undefined) => {
        switch (valid) {
            case true: return <CheckCircleOutlineIcon color='success' />
            case false: return <ErrorOutlineIcon color='error' />
            default: return <StarRoundedIcon />
        }
    }

    const validateBackupDetails = () => {
        if (validateBackupName() && validateBackupLocation() && validateNmapRange()) {
            props.setBasicConfig({
                name: backupName,
                nmapRange: nmapRange,
                location: backupLocation,
                useNmap: useNmap
            })
            props.handleNext()
        }
    }

    return (
        <div>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                Backup Details
            </Typography>
            <Divider className='my-3' />
            <Box style={{ width: '75vw' }}>
                <TextField
                    label="Backup Name" variant="filled" error={backupName === '' ? false : !validateBackupName()}
                    value={backupName} fullWidth onChange={(event) => setBackupName(event.target.value)}
                    helperText="Backup Name to identify the phone to backup." className='mt-4'
                    InputProps={{ 'endAdornment': <InputAdornment position="end">{getInputProps(validateBackupName())}</InputAdornment> }}
                />
                <TextField
                    label="Backup Location" variant="filled" error={backupLocation === '' ? false : !validateBackupLocation()}
                    className='mt-3' fullWidth value={backupLocation} onChange={(event) => setBackupLocation(event.target.value)}
                    helperText="Backup location cannot be a Drive, create a folder and paste the path here."
                    InputProps={{ 'endAdornment': <InputAdornment position="end">{getInputProps(validateBackupLocation())}</InputAdornment> }}
                />
                <div className="d-flex align-items-center my-3">
                    <Tooltip title={useNmap ? 'Use nmap to get connected devices on the network' : 'Manually enter the FTP IP'}>
                        <ToggleButton
                            className='w-25' value="" selected={useNmap}
                            color='primary' onChange={() => setUseNmap(!useNmap)}
                        >
                            {useNmap ? <ToggleOnOutlinedIcon /> : <ToggleOffOutlinedIcon />}
                            <Typography className='ml-2'>
                                {useNmap ? 'Using Nmap' : 'Not using nmap'}
                            </Typography>
                        </ToggleButton>
                    </Tooltip>
                    <TextField
                        label="Local IP range for Nmap Scan" variant="filled" onBlur={validateNmapRange} fullWidth
                        error={!validateNmapRange()} value={nmapRange} className='ml-3'
                        onChange={(event) => setNmapRange(event.target.value)} disabled={!useNmap}
                        helperText="Use CIDR Notation, given IP range is default for most cases."
                        InputProps={{ 'endAdornment': <InputAdornment position="end">{getInputProps(validateNmapRange())}</InputAdornment> }}
                    />
                </div>
            </Box>
            <Button variant="contained" color="primary" onClick={validateBackupDetails}>
                Scan
            </Button>
        </div>
    )
}
