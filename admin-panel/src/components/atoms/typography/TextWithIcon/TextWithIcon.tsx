import { Group, Text } from '@mantine/core';
import React from 'react'
import { TextWithIconProps } from '../../../../types/components.types';

const TextWithIcon = ({ Icon, text, ...props } : TextWithIconProps): React.JSX.Element => (
    <Group justify='start' align='center' gap='4'>
        <Icon size={18} />
        <Text {...props}>{text}</Text>
    </Group>
)

export default TextWithIcon;
