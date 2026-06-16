import { Group, Stack, Stepper, Text, Title } from "@mantine/core";
import classes from "./ImportAccountsModalHeader.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

interface ImportAccountsModalHeaderProps {
    activeStep: number;
}

const ImportAccountsModalHeader = ({ activeStep }: ImportAccountsModalHeaderProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("modals", "import-accounts.header.steps");

    return (
        <Stack className={classes.container}>
            <Stepper
                active={activeStep}
                className={classes.stepper}
            >
                {[1, 2, 3, 4].map((step) => (
                    <Stepper.Step
                        key={step}
                        label={tns(`${step}.label`)}
                        description={tns(`${step}.description`)}
                    >
                        <Group className={classes.titleGroup1}>
                            <Stack className={classes.titleStack}>
                                <Title order={2}>{tns(`${step}.title`)}</Title>
                                <Text>{tns(`${step}.subtitle`)}</Text>
                            </Stack>

                            {/* Optional second info block for step 1 */}
                            {step === 1 && (
                                <Stack className={classes.titleStack}>
                                    <Title order={2}>{tns(`${step}_info.title`)}</Title>
                                    <Text>{tns(`${step}_info.subtitle`)}</Text>
                                </Stack>
                            )}
                        </Group>
                    </Stepper.Step>
                ))}
            </Stepper>
        </Stack>
    );
};

export default ImportAccountsModalHeader;
