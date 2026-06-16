import { Popover, Radio, Stack } from '@mantine/core';
import { PopoverRadioGroupProps } from '../../../../types/components.types';

const PopoverRadioGroup = ({ value, opened, onValueChange, options, children, classNames, ...popoverProps }: PopoverRadioGroupProps): React.JSX.Element => (
    <Popover
        offset={0}
        width="target"
        trapFocus
        opened={opened}
        {...popoverProps}
    >
        <Popover.Target>
            {children}
        </Popover.Target>
        <Popover.Dropdown className={classNames.popoverDropdown}>
            <Radio.Group value={value} onChange={onValueChange}>
                <Stack>
                    {options.map((option) => (
                        <Radio
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            classNames={{ label: classNames.radioLabel }}
                        />
                    ))}
                </Stack>
            </Radio.Group>
        </Popover.Dropdown>
    </Popover>
)

export default PopoverRadioGroup;