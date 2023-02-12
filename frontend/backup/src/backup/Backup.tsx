import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import BackupStatus from 'src/model/BackupStatus';
import BasicConfig from 'src/model/config/BasicConfig';
import FtpConfig from 'src/model/config/FtpConfig';
import WebDirectoryConfig from 'src/model/config/WebDirectoryConfig';
import BackupService from 'src/service/BackupService';
import StartBackup from './steps/StartBackup';
import TestConnection from './steps/TestConnection';
import BackupProgress from './steps/BackupProgress';
import StepData from 'src/model/StepData';
import Steps from 'src/utils/Steps';

interface BackupProps {
    readConfig: Function
    backupData: BackupStatus
    basicConfig: BasicConfig
    ftpConfig: FtpConfig
    directoryConfig: WebDirectoryConfig
}

export default function Backup(props: BackupProps) {
    const [basicConfig, setBasicConfig] = useState(props.basicConfig)
    const [ftpConfig, setFtpConfig] = useState(props.ftpConfig)
    const [directoryConfig, setDirectoryConfig] = useState(props.directoryConfig)
    const [ftpIp, setFtpIp] = useState(props.ftpConfig.device.ip)
    const [value, setValue] = useState(props.backupData.backupStarted ? 2 : 0)
    const [backupService] = useState(BackupService())

    useEffect(() => {
        setBasicConfig(props.basicConfig)
        setFtpConfig(props.ftpConfig)
        setDirectoryConfig(props.directoryConfig)
    }, [props.basicConfig, props.directoryConfig, props.ftpConfig])

    useEffect(() => {
        if (props.basicConfig.name !== basicConfig.name) {
            setValue(props.backupData.backupStarted ? 2 : 0)
        }
    }, [basicConfig.name, props.backupData, props.basicConfig.name])

    const updateCurrentIp = (ftpIp: string) => {
        setFtpIp(ftpIp)
        setValue(1)
    }

    const startBackupStep = () => setValue(2)
    const startBackup = () => backupService.startBackup(props.backupData.selectedConfig, ftpIp)
    const cancelBackup = () => backupService.cancelBackup(props.backupData.selectedConfig)

    const steps: StepData[] = [
        {
            label: 'Test Connection',
            desc: 'Test the connection to the FTP server on your phone before starting the backup',
            component: <TestConnection
                ftpConfig={ftpConfig}
                updateCurrentIp={updateCurrentIp}
                nmapRange={basicConfig.nmapRange}
                useNmap={basicConfig.useNmap}
            />
        },
        {
            label: 'Start Backup',
            desc: 'Validate Backup Config and Start the Backup',
            component: <StartBackup
                savedDirs={directoryConfig.backupDirs}
                startBackupStep={startBackupStep}
            />
        },
        {
            label: 'Backup Progress',
            desc: 'Backup progress is shown with the list of files copied in the current run',
            component: <BackupProgress
                backupName={basicConfig.name}
                startBackup={startBackup}
                cancelBackup={cancelBackup}
                readConfig={props.readConfig}
            />
        }
    ]

    return (
        <Box className="d-flex" style={{ marginTop: '10vh', marginBottom: '7vh' }}>
            <Steps steps={steps} value={value} setValue={() => null} />
        </Box>
    )
}
