import { Checkbox } from "@mantine/core";

const CheckboxHeader = ({ table }): React.JSX.Element => (
    <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={() => table.toggleAllRowsSelected()}
        color="cherry"
    />
);

export default CheckboxHeader;
