import * as React from 'react';

class Header extends React.Component<{ data: any }, any> {
    public render() {
        return (
            <>
                <header>
                    <nav className="navbar sticky-top navbar-expand-lg bg-dark navbar-dark fixed-top">
                        <span className="navbar-brand mb-0 h2 mr-auto">Android FTP Backup</span>

                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="collapsibleNavbar">
                            <ul className="navbar-nav ml-auto">
                                {this.props.data.context.backup_name ?
                                    <>
                                        <li className="nav-item dropdown">
                                            <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true"
                                                aria-expanded="false">Config [{this.props.data.context.backup_name}]</a>
                                            <div className="dropdown-menu">
                                                <a className="dropdown-item" href="#" onClick={(e) => this.addNewConfig(e)}><i className='fas fa-plus'></i> Add</a>
                                                <a className="dropdown-item" href="#" onClick={(e) => this.showConfigModal(e)}><i className='fas fa-check'></i> Select</a>
                                                <div className="dropdown-divider"></div>
                                                <a className="dropdown-item" href="#" onClick={(e) => this.loadConfigPage(e)}><i className='fas fa-pen'></i> Edit</a>
                                            </div>
                                        </li>
                                        <li className="nav-item">
                                            <a className={"nav-link " + (this.props.data.context.backup ? 'active' : '')} href="#"
                                                onClick={(e) => this.loadBackupPage(e)}>Backup</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={"nav-link " + (this.props.data.context.dashboard ? 'active' : '')} href="#"
                                                onClick={(e) => this.loadDashboard(e)}>Dashboard</a>
                                        </li>
                                    </>
                                    :
                                    <li className="nav-item">
                                        <a className="nav-link active">New Backup</a>
                                    </li>
                                }
                            </ul>
                        </div>
                    </nav>
                </header>
            </>
        )
    }

    showConfigModal(e: any) {
        this.props.data.showConfigModal()
    }

    loadBackupPage(e: any) {
        if (this.props.data.context.backup) {
            e.preventDefault()
        } else {
            this.props.data.loadBackupPage(null)
        }
    }

    loadDashboard(e: any) {
        if (this.props.data.context.dashboard) {
            e.preventDefault()
        } else {
            this.props.data.loadDashboard()
        }
    }

    loadConfigPage(e: any) {
        this.props.data.loadConfigPage(true)
    }

    addNewConfig(e: any) {
        this.props.data.loadConfigPage(false)
    }
}

export default Header;
