import { useState } from "react";
import SpreadsheetImportTable from "../../tables/SpreadsheetImportTable/SpreadsheetImportTable";
import { ParsedData } from "../ParseSpreadsheetForm/ParseSpreadsheetForm";
import { Button, Group, Paper, Text } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import classes from "./AssignColsSpreadsheetForm.module.css";
import _ from "lodash";
import AUTO_ASSIGNMENTS from "./autoAssignments";

export interface AssignColsSpreadsheetForm {
    data: ParsedData;
    headers: string[] | null;
    onCancel?: () => void;
    onSubmit?: (assignment: Record<string, string>) => void;
    properties: string[];
}

const AssignColsSpreadsheetForm = ({ properties, data, headers, onCancel, onSubmit }: AssignColsSpreadsheetForm): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "import-accounts");

    const [assignment, setAssignment] = useState(
        headers.reduce(
            (acc, header) => {
                const normalized = header
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z]/g, "");
                const property = _.entries(AUTO_ASSIGNMENTS).find(([_, variants]) => variants.includes(normalized))?.[0];

                if (property) acc[header] = property;

                return acc;
            },
            {} as Record<string, string>,
        ),
    );

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
                    properties: [...properties],
                }}
            />
            <Paper className={classes.outputPaper}>
                <Text fw="600">{tns("assigned", { count: _.values(assignment).filter((e) => e).length, total: properties.length })}</Text>
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
                    {t("go-back")}
                </Button>
                <Button
                    w="150px"
                    variant="white"
                    classNames={{ label: classes.nextButtonLabel }}
                    onClick={() => onSubmit?.(assignment)}
                    disabled={!_.values(assignment).filter((e) => e).length}
                >
                    {t("next")}
                </Button>
            </Group>
        </>
    );
};

export default AssignColsSpreadsheetForm;
