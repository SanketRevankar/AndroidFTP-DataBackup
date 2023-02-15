import * as React from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelIcon from '@mui/icons-material/Cancel'
import LoopRoundedIcon from '@mui/icons-material/LoopRounded'
import { Box, Button, Divider, Typography } from '@mui/material'
import BackupMessage, { BackupState } from 'src/model/BackupMessage'
import FolderIcon from '@mui/icons-material/Folder';
import { getReadableSize } from 'src/utils/FileHelper'

interface BackupProgressProps {
    readConfig: Function
    cancelBackup: () => void
    backupName: string
    startBackup: () => void
}

interface BackupProgressState {
    _isMounted: boolean
    backupState: `${BackupState}`
    scanFolderName: string
    backupData: Map<string, BackupMessage>
}

class BackupProgress extends React.Component<BackupProgressProps, BackupProgressState> {
    ws: WebSocket = new WebSocket('ws://' + window.location.host + '/ws/code/output/')
    controller = new AbortController()
    messagesEndRef: React.RefObject<HTMLDivElement>

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            backupState: BackupState.Started,
            scanFolderName: '',
            backupData: new Map()
        }

        this.displayMessage = this.displayMessage.bind(this)
        this.backupEnterLog = this.backupEnterLog.bind(this)
        this.backupLog = this.backupLog.bind(this)
        this.endStatement = this.endStatement.bind(this)
        this.messagesEndRef = React.createRef()
    }

    public componentDidMount() {
        this.setState({ _isMounted: true })
        this.ws.onmessage = (event) => {
            const payload: BackupMessage = JSON.parse(event.data)
            this.handleData(payload)
            this.scrollToBottom()
        }
        this.ws.onopen = () => this.props.startBackup()
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.ws.close()
        this.controller.abort()
    }

    render() {
        return (
            <Box>
                <Typography variant='h5' className='font-weight-bold' color='primary'>
                    Backup Progress
                </Typography>
                <Divider className='my-3' />
                <Box style={{ maxHeight: '67vh', height: '67vh', overflow: 'overlay', width: '75vw' }} id='backupDataDiv'>
                    {this.getBackupData()}
                    <div ref={this.messagesEndRef} />
                    {(this.state.backupState === BackupState.Scanning || this.state.backupState === BackupState.ConnectionFailed) &&
                        <div className='d-flex align-items-center ml-2 my-3'>
                            {this.getIcon(this.state.backupState)}
                            <Typography className='ml-2' variant='h6' color={this.getColorClass(this.state.backupState)}>
                                {this.state.backupState === 'Scanning' ?
                                    `Scanning Folder ${this.state.scanFolderName}`
                                    :
                                    `Connnection Issue, please check if FTP server is active... ${this.state.scanFolderName}`}
                            </Typography>
                        </div>
                    }
                </Box>
                {this.isEndState(this.state.backupState) ? null :
                    <Button
                        onClick={this.props.cancelBackup}
                        variant='contained' className='mt-3' color='error'
                    >
                        Cancel
                    </Button>
                }
            </Box>
        )
    }

    scrollToBottom() {
        this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    getIcon(state: `${BackupState}`) {
        switch (state) {
            case BackupState.Scanning: return <LoopRoundedIcon fontSize='small' className='App-logo' color='info' />
            case BackupState.Copying: return <LoopRoundedIcon fontSize='small' className='App-logo' color='primary' />
            case BackupState.EnterDirectory: return <FolderIcon fontSize='small' color='primary' />
            case BackupState.Saved: return <CheckCircleOutlineIcon fontSize='small' color='success' />
            case BackupState.Error:
            case BackupState.ConnectionFailed: return <CancelIcon fontSize='small' color='error' />
            case BackupState.Completed: return <CheckCircleOutlineIcon color='success' />
            case BackupState.Cancelled: return <CancelIcon color='error' />
            default: return null
        }
    }

    displayMessage(backupMessage: BackupMessage) {
        switch (backupMessage.state) {
            case BackupState.Copying:
            case BackupState.Saved:
            case BackupState.Error: return this.backupLog(backupMessage)
            case BackupState.Completed:
            case BackupState.Cancelled: return this.endStatement(backupMessage)
            case BackupState.EnterDirectory: return this.backupEnterLog(backupMessage)
            case BackupState.Scanning:
            case BackupState.Started:
            case BackupState.ConnectionFailed:
            default: return null
        }
    }

    getColorClass(state: `${BackupState}`) {
        switch (state) {
            case BackupState.Saved:
            case BackupState.Completed: return 'success.main'
            case BackupState.Error:
            case BackupState.ConnectionFailed:
            case BackupState.Cancelled: return 'error'
            case BackupState.Scanning:
            case BackupState.Started:
            case BackupState.Copying:
            case BackupState.EnterDirectory:
            default: return 'primary'
        }
    }

    isEndState(state: `${BackupState}`) {
        return BackupState.Completed === state || BackupState.Cancelled === state
    }

    endStatement(backupMessage: BackupMessage) {
        return (
            <div className='d-flex align-items-end ml-2 my-3'>
                {this.getIcon(backupMessage.state)}
                <Typography
                    variant='h5' className='mx-2' sx={{ lineHeight: 1 }}
                    color={this.getColorClass(backupMessage.state)}
                >
                    Backup {backupMessage.state}
                </Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                    on {new Date(parseFloat(backupMessage.value) * 1000).toLocaleString('en-IN')}
                </Typography>
            </div>
        )
    }

    backupEnterLog(backupMessage: BackupMessage) {
        return (
            <div className='ml-2 mt-3 d-flex align-items-center'>
                {this.getIcon(backupMessage.state)}
                <Typography className='mx-2'>
                    Backup for
                </Typography>
                <Typography variant="body2" color='primary'>
                    {backupMessage.value}
                </Typography>
            </div>
        )
    }

    backupLog(backupMessage: BackupMessage) {
        return (
            <div className='mt-1 ml-2'>
                <Typography>
                    {this.getIcon(backupMessage.state)}
                    <Typography
                        className='ml-2' variant="caption"
                        color={this.getColorClass(backupMessage.state)}
                    >
                        {backupMessage.state}
                    </Typography>
                    <Typography className='mx-2' variant="caption">
                        {backupMessage.value}
                    </Typography>
                    <Typography variant="caption" color='primary'>
                        {getReadableSize(parseInt(backupMessage.target))}
                    </Typography>
                </Typography>
            </div>
        )
    }

    getBackupData() {
        let backupData: React.ReactElement[] = []
        this.state.backupData.forEach((backupMessage, id) => {
            backupData.push(<div key={id}>
                {this.displayMessage(backupMessage)}
            </div>)
        })
        return backupData
    }

    handleData(backupMessage: BackupMessage) {
        if (this.props.backupName === backupMessage.backup_name) {
            if (backupMessage.state === BackupState.Scanning || backupMessage.state === BackupState.ConnectionFailed) {
                if (backupMessage.value === 'Retry Limit reached, Cancelling Backup.') {
                    alert(backupMessage.value)
                }
                this.setState({
                    backupState: backupMessage.state,
                    scanFolderName: backupMessage.value
                })
            }

            if (this.state._isMounted) {
                this.setState(prevState => ({
                    backupData: prevState.backupData.set(backupMessage.id, backupMessage),
                    backupState: backupMessage.state
                }))
            }

            if (backupMessage.state === BackupState.Completed) {
                this.props.readConfig(backupMessage.backup_name)
            }
        }
    }
}

export default BackupProgress;
