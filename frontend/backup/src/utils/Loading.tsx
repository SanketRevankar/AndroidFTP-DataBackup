import { Typography, Skeleton } from "@mui/material";

export default function Loading() {
    return (
        <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: 100 + 'vh' }}>
            <Typography variant='h4' color='textSecondary'>
                Loading
            </Typography>
            <Skeleton className='w-50' />
            <Skeleton className='w-50' animation="wave" />
        </div>
    )
}