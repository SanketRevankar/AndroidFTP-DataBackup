import * as React from 'react';

class DirList extends React.Component<{ data: any }, any> {

    constructor(props: any) {
        super(props);

        this.clickCheckbox = this.clickCheckbox.bind(this)
        this.clickRadio = this.clickRadio.bind(this)
    }

    public render() {
        const dirs = Object.entries(this.props.data.dir_list).map((item: any) => {
            return (
                <React.Fragment key={item[0]}>
                    <div className="custom-control custom-checkbox col-md-2">
                        <input type="checkbox" className="custom-control-input" id={item[0]} onChange={this.clickCheckbox} checked={item[1].checked ? true : false} />
                        <label className="custom-control-label" htmlFor={item[0]}>{item[0]}</label>
                    </div>
                    <div className="custom-control custom-switch col-md-1">
                        <input type="checkbox" className="custom-control-input" id={item[0] + "-split_by_year_month"} disabled={item[1].checked ? false : true}
                            onChange={this.clickRadio} checked={item[1].split_by_year_month} />
                        <label className="custom-control-label" htmlFor={item[0] + "-split_by_year_month"}>
                            <i className='fas fa-calendar-alt' title='Switch this on if you want folders with year and month of creation created for backing up files'></i>
                        </label>
                    </div>
                    <div className="custom-control custom-switch col-md-1">
                        <input type="checkbox" className="custom-control-input" id={item[0] + "-all_in_one"} disabled={item[1].checked ? false : true}
                            onChange={this.clickRadio} checked={item[1].all_in_one} />
                        <label className="custom-control-label" htmlFor={item[0] + "-all_in_one"}><i className='fas fa-sitemap'
                            title='Switch this on if you want folders within the selected folders to be backed up as one folder only'></i></label>
                    </div>
                </React.Fragment>
            )
        })
        return (
            <div className="form-row mb-3" style={{ marginLeft: '1vw' }}>
                {dirs}
            </div>
        )
    }

    clickCheckbox(event: any) {
        this.props.data.clickCheckbox(event)
    }

    clickRadio(event: any) {
        this.props.data.clickRadio(event)
    }
}

export default DirList;