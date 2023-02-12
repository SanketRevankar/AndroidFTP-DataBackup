import { Box, useTheme } from "@mui/material"
import Chart from "react-google-charts"
import BackupStats, { BackupStat } from "src/model/BackupStats"
import { getReadableSize } from "src/utils/FileHelper"

interface PieChartProps {
    stats: BackupStats
    title: string
    statToChart: keyof BackupStat
}

export default function PieChart(props: PieChartProps) {
    const theme = useTheme()

    const getPieOptions = () => {
        const bgColor = theme.palette.mode === 'dark' ? '#252525' : '#fff'
        const color = theme.palette.mode === 'dark' ? '#fff' : '#252525'

        const pieOptions = {
            pieHole: 0.3,
            backgroundColor: bgColor,
            legend: { textStyle: { color: color } },
            pieSliceBorderColor: bgColor,
            titleTextStyle: { color: color },
        }
        return pieOptions
    }

    const getChartData = (stats: BackupStats, statToChart: keyof BackupStat) => {
        let data: (string | number | object)[][] = [['File Type', statToChart]]
        if (props.statToChart === 'size') {
            data[0].push({role: 'tooltip'})
            data.push(...Object.entries(stats).map(([typeName, stat]) => ([typeName, stat[statToChart], `${typeName}: ${getReadableSize(stat[statToChart])}`])))
        } else {
            data.push(...Object.entries(stats).map(([typeName, stat]) => ([typeName, stat[statToChart]])))
        }
        return data
    }

    return (
        <Box className="google-chart mt-3">
            <Chart
                chartType="PieChart"
                data={getChartData(props.stats, props.statToChart)}
                height='30vh'
                options={{ ...getPieOptions(), title: props.title }}
            />
        </Box>
    )

}