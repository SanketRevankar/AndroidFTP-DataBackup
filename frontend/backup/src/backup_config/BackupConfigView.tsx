import * as React from 'react';
import { useParams } from 'react-router-dom';
import BackupDetails from './steps/BackupDetails';
import FtpDetails from './steps/FtpDetails';
import BackupFolders from './steps/BackupFolders';
import BackupDestination from './steps/BackupDestination';
import BasicConfig from '../model/config/BasicConfig';
import FtpConfig from '../model/config/FtpConfig';
import BackupPreview from './steps/BackupPreview';
import { Box } from '@mui/material';
import BackupConfigService from 'src/service/BackupConfigService';
import { directoryConfigToSavedDir } from 'src/utils/DirectoryHelper';
import BackupConfig from 'src/model/config/BackupConfig';
import WebDirectoryConfig from 'src/model/config/WebDirectoryConfig';
import StepData from 'src/model/StepData';
import Steps from 'src/utils/Steps';

interface BackupConfigProps {
    basicConfig: BasicConfig
    ftpConfig: FtpConfig
    directoryConfig: WebDirectoryConfig
}

export default function BackupConfigView(props: BackupConfigProps) {
    let { mode }: any = useParams()
    const editMode = mode === 'edit'
    const [controller] = React.useState(new AbortController())
    const [basicConfig, setBasicConfig] = React.useState(new BasicConfig())
    const [ftpConfig, setFtpConfig] = React.useState(new FtpConfig())
    const [directoryConfig, setDirectoryConfig] = React.useState(new WebDirectoryConfig())
    const [backupConfigService] = React.useState(BackupConfigService())
    const [value, setValue] = React.useState(0)

    React.useEffect(() => {
        if (editMode) {
            setValue(0)
            setBasicConfig(props.basicConfig)
            setFtpConfig(props.ftpConfig)
            setDirectoryConfig(props.directoryConfig)
        }
    }, [editMode, props.basicConfig, props.directoryConfig, props.ftpConfig])

    React.useEffect(() => () => {
        controller.abort()
    }, [controller])

    const handleNext = () => setValue(value + 1)
    const handleBack = () => setValue(value - 1)

    const saveConfig = () => {
        const configData: BackupConfig = {
            basic: basicConfig,
            ftp: ftpConfig,
            dirs: {
                backupDirs: directoryConfigToSavedDir(directoryConfig)
            }
        }
        return backupConfigService.saveConfig(configData, controller)
            .then((data) => {
                if (data.saved) {
                    window.history.pushState({ urlPath: '/AndroidFTPBackup/backup' }, '', '/AndroidFTPBackup/backup')
                    setTimeout(function () { window.location.reload() }, 500)
                }
            })
            .catch(error => console.log(error))
    }

    const steps: StepData[] = [
        {
            label: 'Backup Details',
            desc: 'Provide basic backup details',
            component: <BackupDetails
                basicConfig={basicConfig}
                mode={mode}
                setBasicConfig={setBasicConfig}
                handleNext={handleNext}
            />
        },
        {
            label: 'FTP Details',
            desc: 'Choose your device and provide FTP details ',
            component: <FtpDetails
                ftpConfig={ftpConfig}
                nmapRange={basicConfig.nmapRange}
                useNmap={basicConfig.useNmap}
                setFtpConfig={setFtpConfig}
                handleNext={handleNext}
                handleBack={handleBack}
            />
        },
        {
            label: 'Backup Folders',
            desc: 'Choose folders from your device that you want to backup',
            component: <BackupFolders
                directoryConfig={directoryConfig}
                backupLocation={basicConfig.location}
                ftpConfig={ftpConfig}
                setDirectoryConfig={setDirectoryConfig}
                handleNext={handleNext}
                handleBack={handleBack}
            />
        },
        {
            label: 'Backup Destination',
            desc: 'Choose where to save the backups',
            component: <BackupDestination
                directoryConfig={directoryConfig}
                setDirectoryConfig={setDirectoryConfig}
                handleNext={handleNext}
                handleBack={handleBack}
            />
        },
        {
            label: 'Preview Config',
            desc: 'Review the configuration created and save',
            component: <BackupPreview
                basicConfig={basicConfig}
                ftpConfig={ftpConfig}
                directoryConfig={directoryConfig}
                saveConfig={saveConfig}
                handleBack={handleBack}
            />
        },
    ]

    return (
        <Box style={{ marginTop: 10 + 'vh', marginBottom: 7 + 'vh' }}>
            <Steps steps={steps} value={value} setValue={setValue} />
        </Box>
    )
}
