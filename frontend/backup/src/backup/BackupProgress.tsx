import { Button, Typography } from '@material-ui/core';
import * as React from 'react';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CancelIcon from '@material-ui/icons/Cancel';
import LoopRoundedIcon from '@material-ui/icons/LoopRounded';
import { red } from '@material-ui/core/colors';

class BackupProgress extends React.Component<{ data: any }, any> {
    ws: WebSocket = new WebSocket('ws://' + window.location.host + '/ws/code/output/');
    controller = new AbortController();

    constructor(props: any) {
        super(props);

        this.state = {
            _isMounted: false,
            backupStarted: { value: this.props.data.backup_started, state: 'Started' },
            backupData: [],
        }
    }

    public componentDidMount() {
        this.setState({ _isMounted: true })
        this.ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            this.handleData(payload);
            this.handleScroll()
        }
    }

    componentWillUnmount() {
        this.setState({ _isMounted: false })
        this.ws.close();
        this.controller.abort()
    }

    render() {
        return (
            <div style={{ maxHeight: '60vh', overflow: 'auto' }} id='backupDataDiv'>
                {this.getBackupData()}
                {this.isEndState(this.state.backupStarted.state) ?
                    null :
                    <Button
                        onClick={this.props.data.cancelBackup}
                        variant='contained'
                        className='mt-3'
                        style={{ backgroundColor: red[600] }}
                    >
                        Cancel
                    </Button>
                }
            </div>
        )
    }

    getIcon(state: string) {
        return {
            'Saved': <CheckCircleOutlineIcon fontSize='small' className='text-success' />,
            'Completed': <CheckCircleOutlineIcon fontSize='small' className='text-success' />,
            'Copying': <LoopRoundedIcon className='fast-spin text-primary' />,
            'Error': <CancelIcon className='text-danger' />,
            'Cancelled': <CancelIcon className='text-danger' />,
        }[state]
    }

    getColorClass(state: string) {
        return {
            'Saved': 'text-success',
            'Copying': 'text-primary',
            'Error': 'text-danger',
            'Completed': 'text-success',
            'Cancelled': 'text-danger',
        }[state]
    }

    isEndState(state: string) {
        return {
            'Completed': true,
            'Cancelled': true,
        }[state]
    }

    endStatement(folder: any) {
        return (
            <div className='d-flex align-items-center ml-2 mt-3'>
                {this.getIcon(folder[0])}
                <Typography variant='h5' className={this.getColorClass(folder[0])}>
                    <span className='ml-2 mr-1'>Backup</span>
                    {folder[0]}
                    <Typography color='textSecondary' className='ml-1' variant="caption">
                        on {folder[1].value}
                    </Typography>
                </Typography>
            </div>
        )
    }

    backupLog(folder: any) {
        return (
            <>
                <Typography variant='h6' color='secondary' className='my-2'>Backing up: {folder[0]}</Typography>
                {Object.entries(folder[1]).map((item: any) => (
                    <div className='ml-2' key={item[0] + item[1].value ? item[1].value : ''}>
                        <Typography>
                            {this.getIcon(item[1].state)}
                            <Typography className={'ml-1 ' + this.getColorClass(item[1].state)} variant="caption">{item[1].state}</Typography>
                            <Typography color='textPrimary' className='ml-1' variant="caption">{item[1].value}</Typography>
                            <Typography color='textSecondary' className='ml-1' variant="caption">to</Typography>
                            <Typography color='secondary' className='ml-1' variant="caption">{item[1].target}</Typography>
                        </Typography>
                    </div>
                ))}
            </>
        )
    }

    getBackupData() {
        let backupData = []
        if (this.state.backupData.length !== 0) {
            backupData = this.state.backupData.map((folder: any) => {
                return (
                    <div key={folder[0]}>
                        {folder[0] === "Completed" || folder[0] === "Cancelled" ?
                            this.endStatement(folder)
                            :
                            this.backupLog(folder)
                        }
                    </div>
                )
            })
        }
        return backupData
    }

    handleScroll() {
        const div = document.getElementById('backupDataDiv')
        if (div !== null && div.scrollTop + 1000 > div.scrollHeight) {
            div.scrollTop = div.scrollHeight
        }
    }

    handleData(data: any) {
        if (this.props.data.backup_name !== data.backup_name) {
            return
        }

        let backupStarted = this.state.backupStarted
        let backupData = this.state.backupData
        if (backupData.length === 0 && data.state !== "Enter Directory") {
            backupData.push(['', {}])
        }
        if (data.state === "Enter Directory") {
            backupData.push([data.value, {}])
        } else if (data.state === "Copying") {
            backupData[backupData.length - 1][1][data.id] = {
                state: data.state,
                value: data.value,
                target: data.target,
            }
        } else if (data.state === "Saved") {
            backupData[backupData.length - 1][1][data.id].state = 'Saved'
        } else if (data.state === "Error") {
            backupData[backupData.length - 1][1][data.id].state = 'Error'
        } else {
            backupData.push([data.state, {}])
            backupStarted.state = data.state
            backupData[backupData.length - 1][1].value = data.value
        }

        if (this.state._isMounted) {
            this.setState({ backupData: backupData, backupStarted: backupStarted })
        }
    }

}

export default BackupProgress;
