import { Modal, Stack } from "@mantine/core";
import { AccountType } from "../../../types/config.types";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { useCallback, useEffect, useState } from "react";
import UploadSpreadsheetForm from "../../../components/organisms/forms/UploadSpreadsheetForm/UploadSpreadsheetForm";
import ImportAccountsModalHeader from "./ImportAccountsModalHeader";
import classes from "./ImportAccountsModal.module.css";
import ParseSpreadsheetForm from "../../../components/organisms/forms/ParseSpreadsheetForm/ParseSpreadsheetForm";
import { ParsedData } from "../../../components/organisms/forms/ParseSpreadsheetForm/ParseSpreadsheetForm";
import AssignColsSpreadsheetForm from "../../../components/organisms/forms/AssignColsSpreadsheetForm/AssignColsSpreadsheetForm";
import VerifySpreadsheetForm from "../../../components/organisms/forms/VerifySpreadsheetForm/VerifySpreadsheetForm";
import _ from "lodash";
import VALIDATION from "./fieldValidation.config";
import useApi from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";
import { isAxiosError } from "axios";
export interface ImportAccountModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
    accountType: AccountType;
}

const PROPERTIES = ["name", "surname", "username", "password", "email"];

type PropertyKey = (typeof PROPERTIES)[number];

const ImportAccountsModal = ({ opened, onClose, onSubmit, accountType }: ImportAccountModalProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "import-accounts");
    const [data, setData] = useState<ParsedData>(null);
    const [headers, setHeaders] = useState<string[] | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [active, setActive] = useState(0);
    const [preparedData, setPreparedData] = useState<Record<PropertyKey, string>[]>([]);
    const { sendRequest } = useApi();

    useEffect(() => {
        setActive(0);
        setFile(null);
        setData(null);
        setHeaders(null);
    }, [opened]);

    const prepareData = useCallback(
        (assignment: Record<string, PropertyKey>) =>
            setPreparedData(data.map((record) => _.mapKeys(_.pick(record, _.keys(assignment)), (_, key) => assignment[key]) as Record<PropertyKey, string>)),
        [JSON.stringify(data)],
    );

    const submit = async () => {
        const total = preparedData.length;
        let successCount = 0;
        let failCount = 0;

        // show initial notification
        const notificationId = notifications.show({
            color: "yellow",
            title: tns("importing.title"),
            message: tns("importing.description", { count: 0, total }),
            loading: true,
            autoClose: false,
            withCloseButton: true,
        });

        onClose?.();

        for (const record of preparedData) {
            console.log(record.username, record.email, record.name);
            try {
                const baseData = {
                    account_type: accountType,
                    username: record.username,
                    password: record.password,
                };

                const optionalData = _.pickBy(
                    {
                        name: record.name,
                        surname: record.surname,
                        email: record.email,
                    },
                    _.identity,
                );

                const res = await sendRequest("POST", "/users/create", { data: { ...baseData, ...optionalData } });

                if (isAxiosError(res)) failCount += 1;
                else successCount += 1;

                notifications.update({
                    id: notificationId,
                    message: tns("importing.description", { count: successCount, total }),
                });
            } catch (err) {
                failCount += 1;
                notifications.update({
                    id: notificationId,
                    message: tns("importing.description", { count: successCount, total }),
                });
            }
        }

        notifications.update({
            id: notificationId,
            loading: false,
            color: failCount > 0 ? "red" : "lime",
            title: failCount > 0 ? tns("importing-error.title") : tns("importing-success.title"),
            message:
                failCount > 0
                    ? tns("importing-error.description", { success: successCount, failed: failCount })
                    : tns("importing-success.description", { count: successCount }),
            autoClose: failCount > 0 ? false : 3000,
            withCloseButton: failCount > 0,
        });

        onSubmit?.();
    };

    const content = [
        <UploadSpreadsheetForm
            properties={PROPERTIES}
            onUpload={(f) => {
                setFile(f);
                setActive(1);
            }}
            onReject={() => console.error("File rejected")}
        />,
        <ParseSpreadsheetForm
            file={file}
            onCancel={() => {
                setData(null);
                setHeaders(null);
                setFile(null);
                setActive(0);
            }}
            onSubmit={(d, h) => {
                setData(d);
                setHeaders(h);
                setActive(2);
            }}
            resetTrigger={opened}
        />,
        <AssignColsSpreadsheetForm
            data={data}
            headers={headers}
            properties={PROPERTIES}
            onCancel={() => {
                setActive(1);
            }}
            onSubmit={(a) => {
                setActive(3);
                prepareData(a);
            }}
        />,
        <VerifySpreadsheetForm
            properties={PROPERTIES}
            validationConfig={VALIDATION}
            data={preparedData}
            setData={setPreparedData}
            onCancel={() => {
                setPreparedData([]);
                setActive(2);
            }}
            onSubmit={submit}
        />,
    ];

    return (
        <Modal
            opened={opened}
            title={<ImportAccountsModalHeader activeStep={active} />}
            onClose={onClose}
            size="auto"
            fullScreen
            classNames={{
                inner: classes.modalInner,
                content: classes.modalContent,
                body: classes.modalBody,
                header: classes.modalHeader,
                title: classes.modalTitle,
            }}
        >
            <Stack className={classes.modalStack}>{content[active]}</Stack>
        </Modal>
    );
};

export default ImportAccountsModal;
