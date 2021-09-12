import { Toolbar, Typography } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { AppBar } from '@material-ui/core';
import * as React from 'react';
import FacebookIcon from '@material-ui/icons/Facebook';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';

class Footer extends React.Component<{ data: any }, any> {
    public render() {
        return (
            <AppBar position="fixed" color="primary" style={{ bottom: 0, top: 'auto' }}>
                <Toolbar variant="dense">
                    <IconButton edge="start" href="https://www.facebook.com/sanket.revankar1" target="_blank" className='mr-2' size="medium">
                        <FacebookIcon fontSize='small' color='action' className='text-light' />
                    </IconButton>
                    <IconButton edge="start" href="https://github.com/SanketRevankar" target="_blank" className='mr-2' size="medium">
                        <GitHubIcon fontSize='small' color='action' className='text-light' />
                    </IconButton>
                    <IconButton edge="start" href="https://www.linkedin.com/in/sanketrevankar/" target="_blank" className='mr-2' size="medium">
                        <LinkedInIcon fontSize='small' color='action' className='text-light' />
                    </IconButton>
                    <Typography className='ml-auto'>
                        {this.props.data.latest_backup ?
                            'Last Backup on: ' + this.props.data.latest_backup
                            :
                            'No backup available.'
                        }
                    </Typography>
                </Toolbar>
            </AppBar>
        )
    }
}

export default Footer;
