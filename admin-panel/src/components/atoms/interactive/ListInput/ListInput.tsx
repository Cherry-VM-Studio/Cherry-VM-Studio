import { ActionIcon, ActionIconProps, Fieldset, Group, ScrollArea, Stack, StackProps } from "@mantine/core";
import { ReactNode } from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { isBoolean } from "lodash";
import cs from "classnames";

interface ListInputProps extends StackProps {
    disabled?: boolean;
    values: Array<any>;
    gap?: number | string;
    createEntryButtonProps?: ActionIconProps;
    removeEntryButtonProps?: ActionIconProps;
    canCreateEntry?: boolean;
    canRemoveEntry?: boolean | ((index: number) => boolean);
    createEntry?: () => void;
    removeEntry?: (index: number) => void;
    row: (value: any, index: number, values: Array<any>) => ReactNode;
    headerRow?: (values: Array<any>) => ReactNode;
}

const ListInput = ({
    h,
    disabled,
    values,
    headerRow = () => null,
    row,
    createEntry = () => {},
    removeEntry = () => {},
    canCreateEntry = true,
    canRemoveEntry = true,
    createEntryButtonProps,
    removeEntryButtonProps,
    ...props
}: ListInputProps): React.JSX.Element => {
    return (
        <ScrollArea
            h={h}
            scrollbars="xy"
        >
            <Stack {...props}>
                {headerRow(values)}
                {...values.map((value, index) => (
                    <Group
                        key={index}
                        align="start"
                        gap="sm"
                        wrap="nowrap"
                    >
                        <ActionIcon
                            variant="default"
                            size="36px"
                            color="white"
                            onClick={() => removeEntry(index)}
                            disabled={(isBoolean(canRemoveEntry) ? !canRemoveEntry : canRemoveEntry(index)) || disabled}
                            {...removeEntryButtonProps}
                            className={cs("borderless", removeEntryButtonProps?.className)}
                        >
                            <IconMinus />
                        </ActionIcon>
                        {row(value, index, values)}
                    </Group>
                ))}
                <Group
                    align="center"
                    gap="sm"
                >
                    <ActionIcon
                        variant="default"
                        size="36px"
                        onClick={() => createEntry()}
                        disabled={!canCreateEntry || disabled}
                        {...createEntryButtonProps}
                        className={cs("borderless", createEntryButtonProps?.className)}
                    >
                        <IconPlus />
                    </ActionIcon>
                </Group>
            </Stack>
        </ScrollArea>
    );
};

export default ListInput;
