import { List, Stack, Text } from "@mantine/core";
import { useState } from "react";
import useErrorHandler from "../../../hooks/useErrorHandler.ts";
import useMantineNotifications from "../../../hooks/useMantineNotifications.tsx";
import TextFieldModal from "../../base/TextFieldModal/TextFieldModal.tsx";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation.ts";

const AddSnapshotModal = ({ opened, close, postSnapshot, initiateSnapshotDataUpdate }) => {
    const { tns } = useNamespaceTranslation("modals", "new-snapshot");
    const { sendNotification } = useMantineNotifications();
    const { parseAndHandleError } = useErrorHandler();
    const [error, setError] = useState<string>("");

    const validate = (value: string) => {
        if (!value || value?.length < 3) return tns("error-too-short");
        if (value.length > 24) return tns("error-too-long");
        if (!/^[!-z]{3,32}$/.test(value))
            return (
                <>
                    <Text
                        component="span"
                        fz="xs"
                    >
                        {tns("error-bad-characters")}
                    </Text>
                    <br />
                    <Text
                        component="span"
                        fz="xs"
                    >
                        {`! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ ] \ ^ _ \``}
                    </Text>
                </>
            );
        return;
    };

    const onConfirm = async (name: string) => {
        const errorCallback = (res: Response, body: object) => {
            res?.status === 409 ? setError(tns("error-duplicate")) : parseAndHandleError(res, body);
        };
        const response = await postSnapshot(name, errorCallback);
        if (!response) return;

        close();
        initiateSnapshotDataUpdate();
        sendNotification("network-panel.snapshot-create", {}, { name: name });
    };

    return (
        <TextFieldModal
            opened={opened}
            title={tns("title")}
            inputProps={{
                withAsterisk: true,
                placeholder: tns("placeholder"),
                description: tns("note"),
            }}
            error={error}
            onValidate={validate}
            onCancel={close}
            onConfirm={onConfirm}
        >
            <Stack gap="xs">
                <Text size="sm">{tns("description")}</Text>
                <List size="sm">
                    <List.Item>{tns("bullet-point1")}</List.Item>
                    <List.Item>{tns("bullet-point2")}</List.Item>
                    <List.Item>{tns("bullet-point3")}</List.Item>
                </List>
            </Stack>
        </TextFieldModal>
    );
};

export default AddSnapshotModal;
