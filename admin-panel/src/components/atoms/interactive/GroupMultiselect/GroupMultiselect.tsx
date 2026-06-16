import { MultiSelect, MultiSelectProps } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { safeObjectValues } from "../../../../utils/misc";
import useFetch from "../../../../hooks/useFetch";
import { GroupExtended } from "../../../../types/api.types";

const GroupMultiselect = (props: MultiSelectProps): React.JSX.Element => {
    const { data: groups } = useFetch<Record<string, GroupExtended>>("/groups/all");
    const { t } = useTranslation();

    const sortOptions = (a, b) => a.label.localeCompare(b.label);

    const groupOptions = safeObjectValues(groups)
        .map((group) => ({
            label: group.name,
            value: group.uuid,
        }))
        .sort(sortOptions);

    return (
        <MultiSelect
            placeholder={t("groups")}
            data={groupOptions}
            hidePickedOptions={true}
            {...props}
            value={groupOptions.length ? props.value : []}
            nothingFoundMessage={t("nothing-found")}
        />
    );
};

export default GroupMultiselect;
