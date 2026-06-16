import React from "react";
import useFetch from "../../../../hooks/useFetch";
import { safeObjectValues } from "../../../../utils/misc";
import RoleInfoCard from "../../display/RoleInfoCard/RoleInfoCard";
import { MultiSelect, MultiSelectProps } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { RoleExtended } from "../../../../types/api.types";

const RoleMultiselect = (props: MultiSelectProps): React.JSX.Element => {
    const { data: roles } = useFetch<Record<string, RoleExtended>>("/roles/all");
    const { hasPermissions } = usePermissions();
    const { t } = useTranslation();

    const sortOptions = (a, b) => (a.disabled !== b.disabled ? a.disabled - b.disabled : a.label.localeCompare(b.label));

    const roleOptions = safeObjectValues(roles)
        .map((role) => ({
            label: role.name,
            value: role.uuid,
            disabled: !hasPermissions(role.permissions),
        }))
        .sort(sortOptions);

    const renderOptions = ({ option, checked }) => <RoleInfoCard role={roles[option.value]} />;

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
