import * as React from 'react';

class Footer extends React.Component<{ data: any }, any> {
    public render() {
        return (
            <footer>
                <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-bottom justify-content-center">
                    <div className="navbar-nav w-100 ai-b">
                        <a href="https://www.facebook.com/sanket.revankar1" target="_blank"
                            className="fab fa-facebook-f footer-link text-light text-decoration-none"></a>
                        <a href="https://github.com/SanketRevankar" target="_blank"
                            className="fab fa-github footer-link text-light text-decoration-none"></a>
                        <a href="https://www.linkedin.com/in/sanketrevankar/" target="_blank"
                            className="fab fa-linkedin-in footer-link text-light text-decoration-none"></a>
                        <p className="navbar-nav nav-item ml-auto footer-link">
                            {this.props.data.latest_backup ?
                                this.props.data.latest_backup
                                :
                                'No backup available.'
                            }
                        </p>
                    </div>
                </nav>
            </footer>
        )
    }
}

export default Footer;
