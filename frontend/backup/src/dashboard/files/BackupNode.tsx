import { TreeItem } from "@mui/lab";
import { IconButton, Tooltip } from "@mui/material";
import BackupData from "src/model/BackupData";
import { handleFileOpen, getReadableSize, joinPath } from "src/utils/FileHelper";
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'

interface BackupNodeProps {
    path: string
    name: string
    nodes: BackupData
    nodeType: 'folder' | 'file'
}

export default function BackupNode(props: BackupNodeProps) {
    const currentPath = joinPath(props.path, props.name)
    const hasNodes = Object.keys(props.nodes.dirs).length > 0 || Object.keys(props.nodes.files).length > 0
    const icon = props.nodeType === 'file' ? <DescriptionIcon /> : (hasNodes ? <FolderIcon /> : <FolderOpenIcon />)

    return (
        <TreeItem
            key={currentPath} nodeId={currentPath}
            label={
                <div className='align-items-center d-flex'>
                    <Tooltip title={<h6 className='my-1'>Open '{currentPath}'</h6>}>
                        <IconButton onClick={(event) => handleFileOpen(event, currentPath)}>
                            {icon}
                        </IconButton>
                    </Tooltip>
                    <h6 className='mb-0 mt-1'>
                        {props.name}
                    </h6>
                    <h6 className='mb-0 mt-1 ml-auto'>
                        {getReadableSize(props.nodes.size)}
                    </h6>
                </div>
            }
        >
            {hasNodes &&
                <div>
                    {Object.entries(props.nodes.dirs).map(([name, data]) => (
                        <BackupNode
                            path={currentPath} name={name} nodes={data}
                            nodeType='folder' key={currentPath + name}
                        />
                    ))}
                    {Object.entries(props.nodes.files).map(([node, size]) => (
                        <BackupNode
                            path={currentPath} name={node} nodes={{ dirs: {}, files: {}, size: size }}
                            nodeType='file' key={currentPath + node}
                        />
                    ))}
                </div>
            }
        </TreeItem>
    )
}