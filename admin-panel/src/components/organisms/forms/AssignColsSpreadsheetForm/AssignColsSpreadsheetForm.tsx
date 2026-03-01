import { useState } from "react";
import SpreadsheetImportTable from "../../tables/SpreadsheetImportTable/SpreadsheetImportTable";
import { ParsedData } from "../ParseSpreadsheetForm/ParseSpreadsheetForm";
import { Button, Group, Paper, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import classes from "./AssignColsSpreadsheetForm.module.css";
import { values } from "lodash";

export interface AssignColsSpreadsheetForm {
    data: ParsedData;
    headers: string[] | null;
    onCancel?: () => void;
    onSubmit?: (assignment: Record<string, string>) => void;
}

const PROPERTIES = ["name", "surname", "email", "username", "password", "account_type", "memberships"] as const;

const AssignColsSpreadsheetForm = ({ data, headers, onCancel, onSubmit }: AssignColsSpreadsheetForm): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "account");

    const [assignment, setAssignment] = useState({});

    const cancel = () => {
        setAssignment({});
        onCancel?.();
    };

    return (
        <>
            <SpreadsheetImportTable
                readOnly
                records={data}
                headers={headers}
                propertyAssignment={{
                    assignment,
                    setAssignment,
                    properties: [...PROPERTIES],
                }}
            />
            <Paper className={classes.outputPaper}>
                <Text fw="600">
                    Assigned {values(assignment).filter((e) => e).length} of {PROPERTIES.length} properties.
                </Text>
            </Paper>
            <Group
                justify="center"
                mt="auto"
            >
                <Button
                    w="150"
                    variant="default"
                    className="borderless"
                    fw="600"
                    classNames={{ label: classes.nextButtonLabel }}
                    onClick={cancel}
                >
                    <Group
                        gap="6"
                        ml="-12px"
                    >
                        <IconChevronLeft
                            size={14}
                            stroke={5}
                        />
                        Go back
                    </Group>
                </Button>
                <Button
                    w="150px"
                    variant="white"
                    classNames={{ label: classes.nextButtonLabel }}
                    onClick={() => onSubmit?.(assignment)}
                >
                    <Group
                        gap="6"
                        ml="12px"
                    >
                        {t("next")}
                        <IconChevronRight
                            size={14}
                            stroke={5}
                        />
                    </Group>
                </Button>
            </Group>
        </>
    );
};

export default AssignColsSpreadsheetForm;
