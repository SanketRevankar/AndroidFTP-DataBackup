import { Typography } from "@mui/material";
import { TypographyProps } from "@mui/material/Typography";

interface NameValueTextProps {
    name: string
    value: string
    nameProps?: TypographyProps
    valueProps?: TypographyProps
    divProps?: React.HTMLAttributes<HTMLDivElement>
    endIcon?: React.ReactNode
}

export default function NameValueText(props: NameValueTextProps) {
    return (
        <div {...props.divProps}>
            <div>
                <Typography variant='body2' {...props.nameProps}>
                    {props.name}
                </Typography>
                <Typography variant='subtitle2' color='primary' className='font-weight-bold' {...props.valueProps}>
                    {props.value}
                </Typography>
            </div>
            {props.endIcon}
        </div>
    )
}
