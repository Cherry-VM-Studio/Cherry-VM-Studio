import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconRefresh, IconRefreshAlert } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import useMantineNotifications from '../../../../hooks/useMantineNotifications';
import { RefreshFlowMachinesButtonProps } from '../../../../types/components.types';
import ConfirmationModal from '../../../../modals/base/ConfirmationModal/ConfirmationModal';

export default function RefreshFlowMachinesButton({isDirty, refreshMachines} : RefreshFlowMachinesButtonProps) {
    const { t } = useTranslation();
    const { sendNotification } = useMantineNotifications();
    const [opened, {open, close}] = useDisclosure();
    
    const Icon = isDirty ? IconRefreshAlert : IconRefresh;

    const onClick = () => isDirty ? open() : onConfirm();
    const onConfirm = () => {
        close();
        refreshMachines();
        sendNotification('network-panel.flow-resetting', {color: 'yellow.7'})
    }
    
    return (
        <>
            <ConfirmationModal 
                opened={opened} 
                onClose={close}
                onConfirm={onConfirm}
                title={t('confirm.np-refresh.title', {ns: 'modals'})}
                message={t('confirm.np-refresh.description', {ns: 'modals'})}
                confirmButtonProps={{color: 'red.7'}}
            />
            <Button
                onClick={onClick}
                variant='default'
                size='sm'
                pl='xs'
                pr='9'
            >
                <Icon size={20}/>
            </Button>
        </>
    )
}