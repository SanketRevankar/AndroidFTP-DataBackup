import BackupStatistics from './stats/BackupStatistics';
import PieChart from './stats/PieChart';
import BackupData from '../model/BackupData';
import BackupFiles from './files/BackupFiles';
import Loading from '../utils/Loading';
import React from 'react';
import FileService from 'src/service/FileService';

interface DashboardState {
    initiated: boolean
    dirs?: BackupData
    stats?: any
}

interface DashboardProps {
    backupLocation: string
}

export default function Dashboard(props: DashboardProps) {
    const [state, setState] = React.useState<DashboardState>({ initiated: false })
    const [controller] = React.useState(new AbortController())

    const loadDirs = React.useCallback(() => {
        FileService().getDashboardData(props.backupLocation, controller)
            .then(data => {
                if (!data.initiated) {
                    setTimeout(() => loadDirs(), 5000)
                } else {
                    setState(data)
                }
            })
            .catch(e => console.log(e))
    }, [controller, props.backupLocation])

    React.useEffect(() => {
        setState({ initiated: false })
        loadDirs()
    }, [loadDirs])

    React.useEffect(() => () => {
        controller.abort()
    }, [controller])

    if (!state.initiated) {
        return <Loading />
    }

    return (
        <div className="d-flex" style={{ marginTop: 10 + 'vh', marginBottom: 5 + 'vh' }}>
            <div className="ml-5" style={{ width: '35vw' }}>
                <BackupStatistics
                    total_size={state.dirs!.size}
                    base_dir={props.backupLocation}
                />
                <PieChart
                    stats={state.stats}
                    title="Disk Space used"
                    statToChart="size"
                />
                <PieChart
                    stats={state.stats}
                    title="Number of files"
                    statToChart="count"
                />
            </div>
            <BackupFiles dirs={state.dirs!} base_dir={props.backupLocation} />
        </div>
    )
}
