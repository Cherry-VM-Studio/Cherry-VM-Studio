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
export interface ImportAccountModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
    accountType: AccountType;
}

const PROPERTIES = ["name", "surname", "username", "password", "email", "account_type", "memberships"];

type PropertyKey = (typeof PROPERTIES)[number];

const ImportAccountsModal = ({ opened, onClose, onSubmit, accountType }: ImportAccountModalProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "account");
    const [data, setData] = useState<ParsedData>(null);
    const [headers, setHeaders] = useState<string[] | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [active, setActive] = useState(0);
    const [preparedData, setPreparedData] = useState<Record<PropertyKey, string>[]>([]);

    useEffect(() => {
        setActive(0);
        setFile(null);
        setData(null);
        setHeaders(null);
    }, [opened]);

    const prepareData = useCallback(
        (assignment: Record<string, PropertyKey>) =>
            setPreparedData(data.map((record) => _.mapKeys(record, (_, key) => assignment[key]) as Record<PropertyKey, string>)),
        [JSON.stringify(data)],
    );

    const content = [
        <UploadSpreadsheetForm
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
            onSubmit={() => {}}
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
