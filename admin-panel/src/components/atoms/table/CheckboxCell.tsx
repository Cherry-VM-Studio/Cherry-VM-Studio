import { Checkbox } from "@mantine/core";
import { CellContext } from "@tanstack/react-table";

const CheckboxCell = ({ row }: CellContext<unknown, unknown>): React.JSX.Element => (
    <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        color="cherry"
        onClick={(e) => e.stopPropagation()}
    />
);

export default CheckboxCell;
