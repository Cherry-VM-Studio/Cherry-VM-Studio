import React from "react";
import useFetch from "../../../../hooks/useFetch";
import RoleInfoCard from "../../display/RoleInfoCard/RoleInfoCard";
import { MultiSelect, MultiSelectProps } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { RoleExtended } from "../../../../types/api.types";
import _ from "lodash";

const RoleMultiselect = (props: MultiSelectProps): React.JSX.Element => {
    const { data: roles } = useFetch<Record<string, RoleExtended>>("/roles/all");
    const { hasPermissions } = usePermissions();
    const { t } = useTranslation();

    // @ts-expect-error
    const sortOptions = (a, b) => (a.disabled !== b.disabled ? a.disabled - b.disabled : a.label.localeCompare(b.label));

    const roleOptions = _.values(roles)
        .map((role) => ({
            label: role.name,
            value: role.uuid,
            disabled: !hasPermissions(role.permissions),
        }))
        .sort(sortOptions);

    // @ts-expect-error
    const renderOptions = ({ option, checked }: any) => <RoleInfoCard role={roles[option.value]} />;

    return (
        <MultiSelect
            placeholder={t("roles")}
            data={roleOptions}
            renderOption={renderOptions}
            hidePickedOptions={true}
            {...props}
            value={roleOptions.length ? props.value : []}
            nothingFoundMessage={t("nothing-found")}
        />
    );
};

export default RoleMultiselect;
