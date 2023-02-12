import * as React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';

interface FooterProps {
    latest_backup?: string
}

class Footer extends React.Component<FooterProps, {}> {
    public render() {
        return (
            <AppBar position="fixed" style={{ bottom: 0, top: 'auto' }}>
                <Toolbar variant="dense">
                    <IconButton href="https://www.facebook.com/sanket.revankar1"
                        target="_blank" className='mr-1'
                    >
                        <FacebookIcon fontSize='small' className='text-light' />
                    </IconButton>
                    <IconButton href="https://github.com/SanketRevankar"
                        target="_blank" className='mr-1'
                    >
                        <GitHubIcon fontSize='small' className='text-light' />
                    </IconButton>
                    <IconButton href="https://www.linkedin.com/in/sanketrevankar/"
                        target="_blank" className='mr-1'
                    >
                        <LinkedInIcon fontSize='small' className='text-light' />
                    </IconButton>
                    <Typography className='ml-auto'>
                        {this.props.latest_backup ?
                            'Last Backup on: ' + new Date(parseFloat(this.props.latest_backup) * 1000).toLocaleString('en-IN')
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
