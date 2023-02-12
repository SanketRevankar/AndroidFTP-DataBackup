import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import EditIcon from '@mui/icons-material/Edit';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { AppBar, Toolbar, Typography, Tooltip, IconButton, Button, Menu, MenuItem, Dialog, DialogContent, RadioGroup, FormControlLabel, Radio, DialogActions, DialogTitle } from '@mui/material';
import BackupStatus from './model/BackupStatus';

interface HeaderProps {
    readConfig: Function
    switchTheme: Function
    themeType: string
    backupData: BackupStatus
    backup_name: string
    backups: string[]
}

interface HeaderState {
    dialogShow: boolean
    menuShow: boolean
    anchorEl: HTMLButtonElement | null
    backupData: BackupStatus
}

class Header extends React.Component<HeaderProps, HeaderState> {

    constructor(props: any) {
        super(props);

        this.state = {
            dialogShow: false,
            menuShow: false,
            anchorEl: null,
            backupData: this.props.backupData,
        }

        this.setAnchorEl = this.setAnchorEl.bind(this)
        this.handleClose = this.handleClose.bind(this)

        this.handleCloseDialog = this.handleCloseDialog.bind(this)
        this.handleConfirm = this.handleConfirm.bind(this)
        this.showConfigDialog = this.showConfigDialog.bind(this)
        this.configSelected = this.configSelected.bind(this)
    }

    public render() {
        return (
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" noWrap className='mr-auto'>
                        Android FTP Backup
                    </Typography>
                    {this.props.backup_name ?
                        this.getRegularHeader()
                        :
                        <Button to="/config/new" activeClassName="selected" component={NavLink} className='mx-2 text-light'>
                            New Backup
                        </Button>
                    }
                    <Tooltip title={(this.props.themeType === 'dark' ? "Light" : "Dark") + " Mode"}>
                        <IconButton className='mx-2' onClick={() => this.props.switchTheme()} edge="end">
                            {this.props.themeType === 'dark' ?
                                <Brightness7Icon color='action' className='text-light' />
                                :
                                <Brightness3Icon color='action' className='text-light' />
                            }
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                {this.getDialog()}
            </AppBar>
        )
    }

    getRegularHeader() {
        return (
            <>
                <Button onClick={this.setAnchorEl}>
                    <Typography className='text-light' variant='button'>
                        Config [{this.props.backup_name}]
                        <ArrowDropDownIcon fontSize='small' />
                    </Typography>
                </Button>
                <Menu
                    anchorEl={this.state.anchorEl} keepMounted
                    open={this.state.menuShow} onClose={this.handleClose}
                >
                    <MenuItem>
                        <NavLink to='/config/new' onClick={this.handleClose} className='text-decoration-none'>
                            <Typography color='text.primary' variant='button'>
                                <AddBoxOutlinedIcon className='mr-3' />
                                Add
                            </Typography>
                        </NavLink>
                    </MenuItem>
                    <MenuItem>
                        <NavLink to='/config/edit' onClick={this.handleClose} className='text-decoration-none'>
                            <Typography color='text.primary' variant='button'>
                                <EditIcon className='mr-3' />
                                Edit
                            </Typography>
                        </NavLink>
                    </MenuItem>
                    <MenuItem onClick={this.showConfigDialog}>
                        <Typography variant='button'>
                            <MenuOpenIcon className='mr-3' />
                            Select
                        </Typography>
                    </MenuItem>
                </Menu>
                <Button to="/backup" activeClassName="selected" component={NavLink} className='mx-2 text-light'>
                    Backup
                </Button>
                <Button to="/dashboard" activeClassName="selected" component={NavLink} className='mx-2 text-light'>
                    Dashboard
                </Button>
            </>
        )
    }

    getDialog() {
        return (
            <Dialog fullWidth open={this.state.dialogShow} onClose={this.handleClose}>
                <DialogTitle className='px-4 mx-3 pt-4 mb-2 font-weight-bold' color='primary'>
                    Select Config
                </DialogTitle>
                <DialogContent className='px-4 mx-3 pb-2'>
                    <Typography color='textSecondary' className='mb-3'>
                        Choose config from below which you want to activate
                    </Typography>
                    <RadioGroup value={this.state.backupData.selectedConfig} onChange={this.configSelected}>
                        {this.props.backups.map((item) => (
                            <FormControlLabel value={item} control={<Radio />} key={item} label={item} />
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions className='d-flex align-items-center justify-content-between mx-4 mb-4'>
                    <Button onClick={this.handleConfirm} color="primary" variant='contained' autoFocus>
                        Load Selected
                    </Button>
                    <Button onClick={this.handleCloseDialog} color="error" variant='outlined'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    setAnchorEl(event: React.MouseEvent<HTMLButtonElement>) {
        this.setState({ anchorEl: event.currentTarget, menuShow: true })
    }

    handleClose() {
        this.setState({ menuShow: false, anchorEl: null })
    }

    handleCloseDialog() {
        this.setState({ dialogShow: false })
    }

    showConfigDialog() {
        this.setState({ dialogShow: true, menuShow: false, anchorEl: null })
    }

    handleConfirm() {
        this.props.readConfig(this.state.backupData.selectedConfig)
        this.handleCloseDialog()
    }

    configSelected(event: any) {
        const backupData = this.state.backupData
        backupData.selectedConfig = event.target.value
        this.setState({ backupData: backupData })
    }
}

export default Header;
