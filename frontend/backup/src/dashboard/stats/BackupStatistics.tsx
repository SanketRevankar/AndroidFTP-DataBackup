import { Button } from "@mui/material";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import { getReadableSize, handleFileOpen } from "src/utils/FileHelper";

interface BackupStatisticsProps {
    base_dir: string
    total_size: number
}

export default function BackupStatistics(props: BackupStatisticsProps) {
    return (
        <div className='d-flex justify-content-center'>
            <Button
                onClick={(event) => handleFileOpen(event, props.base_dir)}
                variant='contained'
                color='primary'
                className='mr-3'
            >
                <FolderOpenIcon className='mr-2' /> Open Backup Folder
            </Button>
            <Button
                variant='contained'
                color='primary'
            >
                <DataUsageIcon className='mr-2' /> Total: {getReadableSize(props.total_size)}
            </Button>
        </div>
    )
}