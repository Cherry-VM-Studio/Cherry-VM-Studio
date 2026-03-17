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
import _, { isUndefined } from "lodash";
import VALIDATION from "./fieldValidation.config";
import useApi from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";
import { isAxiosError } from "axios";
import { IconX } from "@tabler/icons-react";
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
        onClose?.();

        const total = preparedData.length;

        const notificationId = notifications.show({
            color: "yellow",
            title: tns("importing.title"),
            message: tns("importing.description", { total: total }),
            loading: true,
            autoClose: false,
            withCloseButton: true,
        });

        if (total > 4096) {
            return notifications.update({
                id: notificationId,
                color: "red",
                title: tns("importing-error-too-many.title"),
                message: tns("importing-error-too-many.description"),
                autoClose: false,
                withCloseButton: false,
            });
        }

        const updateNotificationToError = () => {
            notifications.update({
                id: notificationId,
                loading: false,
                color: "red",
                title: tns("importing-error.title"),
                message: tns("importing-error.description"),
                autoClose: false,
                withCloseButton: true,
                icon: <IconX />,
            });
        };

        const updateNotificationToSuccess = () => {
            notifications.update({
                id: notificationId,
                loading: false,
                color: "lime",
                title: tns("importing-success.title"),
                message: tns("importing-success.description", { total: total }),
                autoClose: 5000,
                withCloseButton: false,
            });
        };

        const usersData = preparedData.map((record) => ({
            account_type: accountType,
            username: record.username,
            password: record.password,
            ..._.pickBy({ name: record.name, surname: record.surname, email: record.email }, _.identity),
        }));

        const res = await sendRequest("POST", "/users/create-in-bulk", { data: usersData });

        if (isAxiosError(res)) {
            return updateNotificationToError();
        }

        if (isUndefined(res?.job_uuid)) {
            console.warn("POST /users/create-in-bulk didn't return job_uuid property required for fetching the creation status.");
            return updateNotificationToError();
        }

        const jobUuid = res?.job_uuid;
        let status = "pending";

        while (status === "pending") {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const statusRes = await sendRequest("GET", `/users/create-in-bulk/job-status/${jobUuid}`, undefined, null);
            status = statusRes?.status || "error";
        }

        if (status === "error") updateNotificationToError();
        else updateNotificationToSuccess();

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
