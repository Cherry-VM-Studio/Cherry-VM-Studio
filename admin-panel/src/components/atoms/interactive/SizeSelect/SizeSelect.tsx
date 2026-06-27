import { Select } from "@mantine/core";
import React from "react";

export interface SizeSelectProps {
    sizes: number[];
    value: number;
    setValue: (prev: number | string) => any;
}

const SizeSelect = ({ sizes, value, setValue }: SizeSelectProps): React.JSX.Element => {
    const data = sizes.map((size) => `${size}`); //must be passed as an array of strings

    return (
        <Select
            data={data}
            value={`${value}`}
            onChange={setValue}
            classNames={{
                input: "border",
            }}
            w="75"
            h="40"
            withCheckIcon={false}
            allowDeselect={false}
        />
    );
};

export default SizeSelect;
