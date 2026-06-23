import { Select } from "@mantine/core";
import { IconCircle, IconCircleCheck } from "@tabler/icons-react";
import _ from "lodash";

export interface AssignPropertiesHeaderProps {
    properties: string[];
    columnKey: string;
    values: Record<string, string | null>;
    setValues: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

const AssignPropertiesHeader = ({ properties, values, setValues, columnKey }: AssignPropertiesHeaderProps): React.JSX.Element => {
    const onChange = (val: string | null) => setValues((prev) => ({ ...prev, [columnKey]: val }));
    const filteredData = properties.filter((prop: string) => prop === values[columnKey] || !_.values(values).includes(prop));

    return (
        <Select
            w="100%"
            mt="xs"
            mb="xs"
            variant="filled"
            value={values[columnKey]}
            onChange={onChange}
            data={filteredData}
            leftSection={
                values[columnKey] ? (
                    <IconCircleCheck
                        color="var(--mantine-color-dark-1)"
                        size="20"
                    />
                ) : (
                    <IconCircle size="20" />
                )
            }
        />
    );
};

export default AssignPropertiesHeader;
