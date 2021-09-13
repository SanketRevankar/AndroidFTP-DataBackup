import { Button, TextField, Typography } from '@material-ui/core';
import * as React from 'react';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import ToggleButton from '@material-ui/lab/ToggleButton';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

class BackupLocationDetails extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            dirs: this.props.data.directoryConfig.dirs,
        }

        this.updateDirProp = this.updateDirProp.bind(this)
    }

    render() {
        return <div>
            {Object.entries(this.state.dirs).filter(([key, index]) => (this.state.dirs[key].selected)).map(([key, index]) => {
                return <div className='d-flex mt-3' key={key}>
                    <TextField
                        className='w-35'
                        label="Source Folder to Backup"
                        defaultValue={this.state.dirs[key].path}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="outlined"
                    />

                    <div className='ml-3 align-self-center d-flex'>
                        <Typography variant='body1' className='align-self-center'>Will be saved to </Typography>
                        <ArrowRightIcon fontSize='large' />
                    </div>

                    <TextField
                        className='w-35 ml-2'
                        label="Destination Backup Location"
                        variant="outlined"
                        color='secondary'
                        value={this.state.dirs[key].backupLocation}
                        onChange={(e) => this.updateDirProp(key, 'backupLocation', e.target.value)}
                    />

                    <Tooltip title={<h6 className='my-1'>Backup files including files in sub-folders to '{this.state.dirs[key].name}', will not create sub-folders</h6>}>
                        <ToggleButton
                            size='small'
                            value='recursive'
                            className='border-0 ml-3'
                            selected={this.state.dirs[key].recursive}
                            onChange={() => this.updateDirProp(key, 'recursive', !this.state.dirs[key].recursive)}
                        >
                            <AccountTreeIcon color='action' />
                        </ToggleButton>
                    </Tooltip>

                    <Tooltip title={<h6 className='my-1'>Backup files in '{this.state.dirs[key].name}' by creating sub-folders for Year/Month</h6>}>
                        <ToggleButton
                            size='small'
                            value='monthSeparated'
                            className='border-0 ml-3'
                            selected={this.state.dirs[key].monthSeparated}
                            onChange={() => this.updateDirProp(key, 'monthSeparated', !this.state.dirs[key].monthSeparated)}
                        >
                            <EventAvailableIcon color='action' />
                        </ToggleButton>
                    </Tooltip>
                </div>
            })}
            <div className='mt-3'>
                <div>
                    <Button
                        onClick={this.props.data.handleBack}
                        className='mr-2'
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.props.data.setConfig('directoryConfig', {
                            dirs: this.state.dirs,
                            expanded: this.props.data.directoryConfig.expanded
                        })}
                    >Preview Config</Button>
                </div>
            </div>
        </div>
    }

    updateDirProp(path: string, param: string, value: string | boolean) {
        let dirs = this.state.dirs
        dirs[path][param] = value

        this.setState({ dirs: dirs })
    }

}

export default BackupLocationDetails;