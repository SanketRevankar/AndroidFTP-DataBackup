import * as React from 'react';
import { NavLink } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import { AppBar, Button, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness3Icon from '@material-ui/icons/Brightness3';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import EditIcon from '@material-ui/icons/Edit';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import { Dialog, DialogActions, DialogContent, FormControlLabel, Radio, RadioGroup } from '@material-ui/core';

class Header extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            dialogShow: false,
            menuShow: false,
            anchorEl: null,
            backupData: this.props.data.backupData,
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
            <>
                <header>
                    <AppBar position="fixed">
                        <Toolbar>
                            <Typography variant="h6" noWrap className='mr-auto'>
                                Android FTP Backup
                            </Typography>
                            {this.props.data.backup_name ?
                                this.getRegularHeader()
                                :
                                <Typography align="right">
                                    New Backup
                                </Typography>
                            }
                            <Tooltip title={(this.props.data.themeType == 'dark' ? "Light" : "Dark") + " Mode"}>
                                <IconButton aria-label="delete" onClick={this.props.data.switchTheme} edge="end">
                                    {
                                        this.props.data.themeType == 'dark' ?
                                            <Brightness7Icon color='action' className='text-light' />
                                            :
                                            <Brightness3Icon color='action' className='text-light' />
                                    }
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>
                    {this.getDialog()}
                </header>
            </>
        )
    }

    getRegularHeader() {
        return (
            <>
                <Button onClick={this.setAnchorEl}>
                    <Typography className='text-light' variant='button'>
                        Config [{this.props.data.backup_name}] <ArrowDropDownIcon fontSize='small' />
                    </Typography>
                </Button>
                <Menu
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={this.state.menuShow}
                    onClose={this.handleClose}
                >
                    <MenuItem>
                        <NavLink to='/config/new' className='text-decoration-none' onClick={this.handleClose}>
                            <Typography color='textPrimary' variant='button'>
                                <AddBoxOutlinedIcon className='mr-3' />Add
                            </Typography>
                        </NavLink>
                    </MenuItem>
                    <MenuItem>
                        <NavLink to={'/config/edit'} className='text-decoration-none' onClick={this.handleClose}>
                            <Typography color='textPrimary' variant='button'>
                                <EditIcon className='mr-3' />Edit
                            </Typography>
                        </NavLink>
                    </MenuItem>
                    <MenuItem onClick={this.showConfigDialog}>
                        <Typography color='textPrimary' variant='button'>
                            <MenuOpenIcon className='mr-3' />Select
                        </Typography>
                    </MenuItem>
                </Menu>
                <NavLink to="/backup" activeClassName="MuiButton-outlined" className='MuiButtonBase-root MuiButton-root MuiButton-text text-decoration-none mx-2'>
                    <Typography variant='button' className='text-light'>
                        Backup
                    </Typography>
                </NavLink>
                <NavLink to="/dashboard" activeClassName="MuiButton-outlined" className='MuiButtonBase-root MuiButton-root MuiButton-text text-decoration-none mr-2'>
                    <Typography variant='button' className='text-light'>
                        Dashboard
                    </Typography>
                </NavLink>
            </>
        )
    }

    getDialog() {
        return (
            <Dialog
                open={this.state.dialogShow}
                onClose={this.handleClose}
            >
                <Typography color='textPrimary' variant='h5' className='MuiDialogTitle-root p-3 text-center'>
                    Select Config
                </Typography>
                <DialogContent>
                    <Typography color='textSecondary' className='mb-3'>
                        Choose config from below which you want to activate
                    </Typography>
                    <RadioGroup value={this.state.backupData.selectedConfig} onChange={this.configSelected}>
                        {this.state.backupData.backups.map((item: any) => (
                            <FormControlLabel value={item} control={<Radio />} key={item} label={item} />
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCloseDialog}>
                        Close
                    </Button>
                    <Button onClick={this.handleConfirm} color="primary" variant='contained' autoFocus>
                        Load Selected
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
        fetch('/AndroidFTPBackup/api/set_config?name=' + this.state.backupData.selectedConfig)
            .then(_data => {
                window.location.reload()
            })
    }

    configSelected(event: any) {
        const backupData = this.state.backupData
        backupData.selectedConfig = event.target.value
        this.setState({ backupData: backupData })
    }
}

export default Header;
