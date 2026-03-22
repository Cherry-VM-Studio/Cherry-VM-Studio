import { MultiSelect, MultiSelectProps } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import BusinessCard from "../../../atoms/display/BusinessCard/BusinessCard";
import classes from "./UserMultiselect.module.css";
import { useElementSize } from "@mantine/hooks";
import { User, UserExtended } from "../../../../types/api.types";

export interface UserMultiselectProps extends MultiSelectProps {
    users: User[] | UserExtended[];
    classNames?: { [key: string]: any };
}

const UserMultiselect = ({ users, classNames, onChange, value, ...props }: UserMultiselectProps): React.JSX.Element => {
    const { ref } = useElementSize();
    const { t } = useTranslation();

    const options = users.map(({ uuid, name, surname, username }) => ({
        value: uuid,
        label: name || surname ? `${name} ${surname}` : username,
    }));

    const renderOption = ({ option }) => (
        <BusinessCard
            name={option.label}
            size="sm"
        />
    );

    const onInputChange = (val) => {
        ref.current.parentElement.parentElement.scrollTo({ left: ref.current.parentElement.parentElement.scrollWidth });
        onChange?.(val);
    };

    return (
        <MultiSelect
            ref={ref}
            data={options}
            renderOption={renderOption}
            searchable
            hidePickedOptions
            rightSectionWidth={16}
            rightSection={<></>}
            value={value}
            nothingFoundMessage={t("nothing-found")}
            onChange={onInputChange}
            classNames={{
                ...classNames,
                dropdown: `border ${classNames?.dropdown}`,
                input: `${classes.clientsInput} ${classNames?.input}`,
                pill: `${classes.pill} ${classNames?.pill}`,
                option: `${classes.option} ${classNames?.option}`,
            }}
            comboboxProps={{
                transitionProps: { transition: "pop", duration: 200 },
            }}
            limit={20}
            {...props}
        />
    );
};

export default UserMultiselect;
