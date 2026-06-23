import { Checkbox } from "@mantine/core";
import { CellContext } from "@tanstack/react-table";

const CheckboxHeader = ({ table }: CellContext<unknown, unknown>): React.JSX.Element => (
    <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={() => table.toggleAllRowsSelected()}
        color="cherry"
    />
);

export default CheckboxHeader;
