import { Button, ButtonProps, Group } from "@mantine/core";
import React, { useState } from "react";
import UserMultiselect, { UserMultiselectProps } from "../UserMultiselect/UserMultiselect";
import classes from "./AddMembersField.module.css";
import useFetch from "../../../../hooks/useFetch";
import { safeObjectValues } from "../../../../utils/misc";
import { IconUserPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ClientExtended } from "../../../../types/api.types";

export interface AddMembersFieldProps {
    onSubmit: (uuids: string[]) => void;
    alreadyAddedUuids: string[];
    multiselectProps?: Partial<UserMultiselectProps>;
    buttonProps?: Partial<ButtonProps>;
}

const AddMembersField = ({ onSubmit, alreadyAddedUuids, multiselectProps, buttonProps }: AddMembersFieldProps): React.JSX.Element => {
    const { data } = useFetch<Record<string, ClientExtended>>("/users/all?account_type=client");
    const { t } = useTranslation();
    const [selected, setSelected] = useState([]);

    const users = safeObjectValues(data).filter((user) => !alreadyAddedUuids.includes(user.uuid));

    const submit = () => {
        onSubmit(selected);
        setSelected([]);
    };

    return (
        <Group>
            <UserMultiselect
                placeholder={selected.length ? "" : t("enter-users-to-add")}
                w={"calc(100% - 136px)"}
                users={users}
                classNames={classes}
                onChange={(val) => setSelected(val)}
                value={selected}
                {...multiselectProps}
            />

            <Button
                w={120}
                variant="default"
                leftSection={<IconUserPlus size={20} />}
                onClick={submit}
                {...buttonProps}
            >
                {t("add")}
            </Button>
        </Group>
    );
};

export default AddMembersField;
