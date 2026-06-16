import { Button, Portal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ComponentType } from "react";

export interface ModalButtonProps {
    ModalComponent: ComponentType<{ opened: boolean; onClose: () => void }>;
    ButtonComponent?: ComponentType<any>;
    modalProps?: any;
    buttonProps?: any;
    children: any;
}

export default function ModalButton({ children, ModalComponent, ButtonComponent = Button, modalProps, buttonProps }: ModalButtonProps) {
    const [opened, { open, close }] = useDisclosure();

    const onButtonClick = (e: MouseEvent) => {
        e.preventDefault();
        open();
        buttonProps?.onClick?.();
    };

    return (
        <>
            {ModalComponent ? (
                <Portal>
                    <ModalComponent
                        opened={opened}
                        onClose={close}
                        {...modalProps}
                    />
                </Portal>
            ) : (
                <></>
            )}
            <ButtonComponent
                onClick={onButtonClick}
                {...buttonProps}
            >
                {children}
            </ButtonComponent>
        </>
    );
}
