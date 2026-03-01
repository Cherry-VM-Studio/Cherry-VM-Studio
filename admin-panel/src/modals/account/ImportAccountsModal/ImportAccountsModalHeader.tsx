import { Group, Stack, Stepper, Text, Title } from "@mantine/core";
import classes from "./ImportAccountsModalHeader.module.css";

interface ImportAccountsModalHeaderProps {
    activeStep: number;
}

const ImportAccountsModalHeader = ({ activeStep }: ImportAccountsModalHeaderProps): React.JSX.Element => {
    return (
        <Stack className={classes.container}>
            <Stepper
                active={activeStep}
                className={classes.stepper}
            >
                <Stepper.Step
                    label="Step 1:"
                    description="Upload the file"
                >
                    <Group className={classes.titleGroup1}>
                        <Stack className={classes.titleStack}>
                            <Title order={2}>Upload the file</Title>
                            <Text>Make sure the file is in the CSV format.</Text>
                        </Stack>
                        <Stack className={classes.titleStack}>
                            <Title order={2}>The data we're looking for</Title>
                            <Text>You will have a chance to rename and rearange your columns in the next steps. </Text>
                        </Stack>
                    </Group>
                </Stepper.Step>
                <Stepper.Step
                    label="Step 2:"
                    description="Choose parsing options"
                >
                    <Stack className={classes.titleStack}>
                        <Title order={2}>Configure parsing</Title>
                        <Text>Define the parsing configuration and click the reparse button submit changes.</Text>
                    </Stack>
                </Stepper.Step>
                <Stepper.Step
                    label="Step 3:"
                    description="Assign columns to parameters"
                >
                    <Stack className={classes.titleStack}>
                        <Title order={2}>Assign columns</Title>
                        <Text>Match your columns to the account creation parameters.</Text>
                    </Stack>
                </Stepper.Step>
                <Stepper.Step
                    label="Step 4:"
                    description="Validate and submit"
                />
            </Stepper>
        </Stack>
    );
};

export default ImportAccountsModalHeader;
