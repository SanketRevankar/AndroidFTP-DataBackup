import * as React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import { Paper, Tooltip, Typography } from '@material-ui/core';
import Directory from 'src/models/Directory';
import Grid from '@material-ui/core/Grid';

class BackupDirView extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);

    }

    render() {
        return (
            <div className='mr-4'>
                <Typography variant='h5'>Backup Folders</Typography>
                <Paper className='pl-3 pr-4 mt-3 py-2' variant="outlined" style={{ maxHeight: 75 + 'vh', overflow: 'hidden auto', maxWidth: 35 + 'vw' }}>
                        {this.props.data.savedDirs.map((dir: Directory) => (
                                <Grid container spacing={1} className='py-1'>
                                    <Grid item md={1}>
                                        <Tooltip title={<h6 className='my-1'>Backup files including files in sub-folders to '{dir.name}', will not create sub-folders</h6>}>
                                            <ToggleButton
                                                size='small'
                                                value='recursive'
                                                className='border-0'
                                                selected={dir.recursive}
                                            >
                                                <AccountTreeIcon color='action' />
                                            </ToggleButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item md={1}>
                                        <Tooltip title={<h6 className='my-1'>Backup files in '{dir.name}' by creating sub-folders for Year/Month</h6>}>
                                            <ToggleButton
                                                size='small'
                                                value='monthSeparated'
                                                className='border-0'
                                                selected={dir.monthSeparated}
                                            >
                                                <EventAvailableIcon color='action' />
                                            </ToggleButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item md={10}>
                                        <div className="d-flex flex-column pl-3">
                                            <Tooltip title={<h6 className='my-1'>{dir.path}</h6>} placement="bottom-start">
                                                <Typography
                                                    className='wrap-left'
                                                    variant='body2'
                                                >
                                                    {dir.path}
                                                </Typography>
                                            </Tooltip>
                                            <Tooltip title={<h6 className='my-1'>{dir.backupLocation}</h6>} placement="bottom-start">
                                                <Typography
                                                    className='wrap-left'
                                                    variant='caption'
                                                    color='textSecondary'
                                                >
                                                    {dir.backupLocation}
                                                </Typography>
                                            </Tooltip>
                                        </div>
                                    </Grid>
                                </Grid>
                        ))}
                </Paper>
            </div >
        )
    }
}

export default BackupDirView;
