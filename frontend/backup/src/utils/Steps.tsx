import { Box, Divider, Typography, Slide } from "@mui/material";
import React from "react";
import StepData from "src/model/StepData";

interface StepsProps {
    steps: StepData[]
    value: number
    setValue: Function
}

export default function Steps(props: StepsProps) {

    return (
        <Box className="d-flex">
            <Divider />
            <Box className="d-flex flex-column" sx={{ height: '83vh', overflow: 'overlay' }}>
                {props.steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <Box
                            sx={{
                                px: 5, py: 4, width: '20vw',
                                backgroundColor: (props.value === index ? '#5a93f524' : ''),
                                borderRight: (props.value === index ? '5px solid white' : ''),
                                borderRightColor: 'primary.main'
                            }}
                            onClick={() => props.setValue(props.value > index ? index : props.value)}
                        >
                            <Typography variant='h6' color={index < props.value ? 'success.main' : 'primary'} className='font-weight-bold'>
                                {step.label}
                            </Typography>
                            <Typography variant='subtitle2' color='text.secondary'>
                                {step.desc}
                            </Typography>
                        </Box>
                        <Divider />
                    </React.Fragment>
                ))}
            </Box>
            <Divider orientation='vertical' sx={{ height: '83vh', mr: 4 }} />
            <div className="d-flex">
                {props.steps.map((step, index) => (
                    <Slide direction="up" key={index} in={props.value === index} mountOnEnter timeout={0}>
                        <div className={"p-2 " + (props.value === index ? 'd-block' : 'd-none')}>
                            {step.component}
                        </div>
                    </Slide>
                ))}
            </div>
        </Box>
    )
}