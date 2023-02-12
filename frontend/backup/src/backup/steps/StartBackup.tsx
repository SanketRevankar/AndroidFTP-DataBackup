import { Typography, Tooltip, ToggleButton, Box, Button, Divider } from '@mui/material';
import Directory from 'src/model/Directory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NameValueText from 'src/utils/NameValueText';

interface StartBackupProps {
    savedDirs: Directory[]
    startBackupStep: Function
}

export default function StartBackup(props: StartBackupProps) {

    return (
        <Box>
            <Typography variant='h5' className='font-weight-bold' color='primary'>
                Backup Folders
            </Typography>
            <Divider className='my-3' />
            <Box style={{ maxHeight: '65vh', overflow: 'overlay', width: '75vw' }}>
                {props.savedDirs.map((dir, index) => (
                    <div className='d-flex mb-2' key={index}>
                        <Tooltip title={<h6 className='my-1'>Backup files including files in sub-folders to '{dir.path}', will not create sub-folders</h6>}>
                            <ToggleButton size='small' value='recursive' className='mr-3' selected={dir.recursive} color='primary'>
                                <AccountTreeIcon />
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip title={<h6 className='my-1'>Backup files in '{dir.path}' by creating sub-folders for Year/Month</h6>}>
                            <ToggleButton size='small' value='monthSeparated' className='mr-4' selected={dir.monthSeparated} color='primary'>
                                <EventAvailableIcon />
                            </ToggleButton>
                        </Tooltip>
                        <div className='d-flex flex-column py-1'>
                            <NameValueText name={dir.path} value={dir.backupLocation} />
                        </div>
                    </div>
                ))}
            </Box>
            <Button color='primary' variant='contained' onClick={() => props.startBackupStep()} className='mt-4'>
                Start Backup
            </Button>
        </Box>
    )
}
