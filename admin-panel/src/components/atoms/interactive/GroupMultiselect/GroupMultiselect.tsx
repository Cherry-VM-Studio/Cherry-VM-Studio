import { MultiSelect, MultiSelectProps } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import useFetch from "../../../../hooks/useFetch";
import { GroupExtended } from "../../../../types/api.types";
import _ from "lodash";

const GroupMultiselect = (props: MultiSelectProps): React.JSX.Element => {
    const { data: groups } = useFetch<Record<string, GroupExtended>>("/groups/all");
    const { t } = useTranslation();

    // @ts-expect-error
    const sortOptions = (a, b) => a.label.localeCompare(b.label);

    const groupOptions = _.values(groups)
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
