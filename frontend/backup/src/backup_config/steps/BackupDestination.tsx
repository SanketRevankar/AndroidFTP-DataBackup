import * as React from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Box, Button, Divider, TextField, ToggleButton, Tooltip, Typography } from '@mui/material';
import WebDirectoryConfig from 'src/model/config/WebDirectoryConfig';

interface BackupDestinationProps {
    directoryConfig: WebDirectoryConfig
    setDirectoryConfig: Function
    handleBack: () => void
    handleNext: Function
}

export default function BackupDestination(props: BackupDestinationProps) {
    const [directoryConfig, setDirectoryConfig] = React.useState(props.directoryConfig)

    React.useEffect(() => {
        setDirectoryConfig(props.directoryConfig)
    }, [props.directoryConfig])

    const updateDirProp = (path: string, param: string, value: string | boolean) => {
        let dirs = directoryConfig.dirs
        dirs[path][param] = value
        setDirectoryConfig({ ...directoryConfig, dirs: dirs })
    }

    const saveDestination = () => {
        props.setDirectoryConfig({
            dirs: directoryConfig.dirs,
            expanded: directoryConfig.expanded
        })
        props.handleNext()
    }

    return (
        <div>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                Backup Destination
            </Typography>
            <Divider className='my-3' />
            <Box style={{ maxHeight: '65vh', overflow: 'overlay', width: '75vw' }}>
                {Object.entries(directoryConfig.dirs)
                    .filter(([key, dir]) => (dir.selected))
                    .map(([key, dir]) => {
                        return <div className='d-flex mt-3' key={key}>
                            <TextField
                                className='w-40' label="Folder to Backup" disabled
                                defaultValue={dir.path}
                                InputProps={{ readOnly: true }} variant="filled"
                            />
                            <div className='ml-3 align-self-center d-flex'>
                                <Typography variant='body1' className='align-self-center'>
                                    Will be saved to
                                </Typography>
                                <ArrowRightIcon fontSize='large' />
                            </div>
                            <TextField
                                className='w-40 ml-2' label="Backup Location" variant="filled"
                                value={dir.backupLocation}
                                onChange={(e) => updateDirProp(key, 'backupLocation', e.target.value)}
                            />
                            <Tooltip title={<h6 className='my-1'>Backup files including files in sub-folders to '{dir.name}', will not create sub-folders</h6>}>
                                <ToggleButton
                                    value='recursive' className='ml-3' selected={dir.recursive} color='primary'
                                    onChange={() => updateDirProp(key, 'recursive', !dir.recursive)}
                                >
                                    <AccountTreeIcon />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip title={<h6 className='my-1'>Backup files in '{dir.name}' by creating sub-folders for Year/Month</h6>}>
                                <ToggleButton
                                    value='monthSeparated' className='ml-3' selected={dir.monthSeparated} color='primary'
                                    onChange={() => updateDirProp(key, 'monthSeparated', !dir.monthSeparated)}
                                >
                                    <EventAvailableIcon />
                                </ToggleButton>
                            </Tooltip>
                        </div>
                    })}
            </Box>
            <div className='mt-4 d-flex justify-content-between'>
                <Button variant="contained" color="primary" onClick={saveDestination}>
                    Preview Config
                </Button>
                <Button onClick={props.handleBack} color="error" variant="outlined" >
                    Back
                </Button>
            </div>
        </div>
    )
}
