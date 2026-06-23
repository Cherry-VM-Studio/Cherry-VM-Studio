import { Popover, PopoverProps, Radio, Stack } from "@mantine/core";

export interface PopoverRadioGroupProps extends Omit<PopoverProps, "value" | "onChange" | "classNames"> {
    value: string;
    options: { value: string; label: string }[];
    classNames?: {
        popoverDropdown?: string;
        radioLabel?: string;
    };
    onValueChange: (value: string) => void;
}
const PopoverRadioGroup = ({ value, opened, onValueChange, options, children, classNames, ...popoverProps }: PopoverRadioGroupProps): React.JSX.Element => (
    <Popover
        offset={0}
        width="target"
        trapFocus
        opened={!!opened}
        {...popoverProps}
    >
        <Popover.Target>{children}</Popover.Target>
        <Popover.Dropdown className={classNames?.popoverDropdown}>
            <Radio.Group
                value={value}
                onChange={onValueChange}
            >
                <Stack>
                    {options.map((option) => (
                        <Radio
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            classNames={{ label: classNames?.radioLabel }}
                        />
                    ))}
                </Stack>
            </Radio.Group>
        </Popover.Dropdown>
    </Popover>
);

export default PopoverRadioGroup;
