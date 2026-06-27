import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { RestoreButtonProps } from '../../../../types/components.types';
import ConfirmationModal from '../../../../modals/base/ConfirmationModal/ConfirmationModal';

export default function RestoreButton({ onConfirm, buttonProps, modalProps }: RestoreButtonProps) {
    const { t } = useTranslation();

    const [opened, { open, close }] = useDisclosure();

    const onConfirmModal = () => {
        close();
        onConfirm();
    }

    return (
        <>
            <ConfirmationModal
                {...modalProps}
                opened={opened}
                onClose={close}
                onConfirm={onConfirmModal}
                confirmButtonProps={{ color: 'red.7' }}
            />
            <Button
                {...buttonProps}
                onClick={open}
                variant='default'
            >
                {t('discard')}
            </Button>
        </>
    )
}
