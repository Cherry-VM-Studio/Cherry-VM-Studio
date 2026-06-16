import { Grid, GridColProps, Paper } from "@mantine/core";
import classes from "./Column.module.css";

function Column({ span, children, ...props }: GridColProps): React.JSX.Element {
    return (
        <Grid.Col
            span={span}
            className={classes.column}
            {...props}
        >
            <Paper
                className={classes.columnPaper}
                withBorder
            >
                {children}
            </Paper>
        </Grid.Col>
    );
}

export { Column as default };
