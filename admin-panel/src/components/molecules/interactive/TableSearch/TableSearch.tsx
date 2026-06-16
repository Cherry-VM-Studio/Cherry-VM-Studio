import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React from "react";
import { Filter } from "../../../../types/table.types";
import { TableSearchProps } from "../../../../types/components.types";
import { useTranslation } from "react-i18next";

const TableSearch = ({ setFilters, id, toggleAllRowsSelected, ...props } : TableSearchProps): React.JSX.Element => {
    const {t} = useTranslation();

    const updateFilters = (value: string) => setFilters((prev: Filter[]) =>
        prev.filter(f => f.id !== id).concat({ id, value })
    );

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        toggleAllRowsSelected(false);
        updateFilters(e.currentTarget.value);
    }

    return (
        <TextInput
            placeholder={t('search')}
            leftSection={<IconSearch size={16} />}
            onChange={onChange}
            {...props}
        />
    );
}

export default TableSearch;