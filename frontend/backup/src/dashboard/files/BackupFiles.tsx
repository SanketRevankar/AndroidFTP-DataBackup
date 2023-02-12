import { TreeView } from "@mui/lab"
import { Typography, Paper } from "@mui/material"
import BackupData from "src/model/BackupData"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BackupNode from "./BackupNode"

interface BackupFilesProps {
    base_dir: string
    dirs: BackupData
}

export default function BackupFiles(props: BackupFilesProps) {
    const backupBase = props.base_dir.split('/')
    const backupDirName = backupBase[backupBase.length - 1]
    const backupDirPath = backupBase.slice(0, backupBase.length - 1).join('/')

    return (
        <div className="mx-5" style={{ width: '60vw' }}>
            <Typography variant='h4'>
                Backed up Files
            </Typography>
            <Paper className='w-100 mt-2 list-group-div' elevation={3} style={{ maxHeight: '75vh', overflow: 'overlay' }}>
                <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    defaultExpanded={[props.base_dir!]}
                    className='px-3 py-2'
                >
                    <BackupNode
                        path={backupDirPath} name={backupDirName}
                        nodes={props.dirs} nodeType='folder'
                    />
                </TreeView>
            </Paper>
        </div>
    )

}