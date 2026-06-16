import { Sparkline } from "@mantine/charts";
import { SparklineWithTextProps } from "../../../../types/components.types";
import { Container, Paper, Stack, Text } from "@mantine/core";
import React from "react";
import classes from "./SparklineWithText.module.css";

const SparklineWithText = ({ label, chartData, color = 'suse-green', ...sparklineProps }: SparklineWithTextProps) => {
    const data = [
        ...chartData?.slice(0, chartData.length / 2),
        50, 50, 100, 50, 50,
        ...chartData?.slice(chartData.length / 2)
    ];

    return (
        <Container className={classes.mainContainer}>
            <Sparkline
                className={classes.sparkline}
                data={data}
                fillOpacity={0.2}
                color={color}
                {...sparklineProps}
            />

            <Stack className={classes.labelContainer}>
                <Paper className={classes.labelBackground} shadow='0'>
                    <Text className={classes.labelText} c={color}>
                        {label.toUpperCase()}
                    </Text>
                </Paper>
            </Stack>
        </Container>
    )
}

export default SparklineWithText;
