import * as React from 'react';
import Button from '@material-ui/core/Button';

class BackupConfigPreview extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);

    }

    render() {
        return <div>
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
                        onClick={this.props.data.saveConfig}
                    >Save Config</Button>
                </div>
            </div>
        </div>
    }

}

export default BackupConfigPreview;