import React from 'react'
import { Stack } from '@mantine/core'
import TextWithIcon from '../../../atoms/typography/TextWithIcon/TextWithIcon'
import { MachineConnectionDetailsProps } from '../../../../types/components.types'
import { IconHomeLink, IconHomeX, IconScreenShare, IconScreenShareOff } from '@tabler/icons-react'

const MachineConnectionDetails = ({ active, machine } : MachineConnectionDetailsProps): React.JSX.Element => {
    return (
        <Stack gap='xs'>
            <TextWithIcon 
                text={machine.domain} 
                Icon={active ? IconScreenShare : IconScreenShareOff}
            />
            <TextWithIcon 
                text={`172.168.0.1:${machine.port}`} 
                Icon={active ? IconHomeLink : IconHomeX}
            />
        </Stack>
    )
}

export default MachineConnectionDetails;