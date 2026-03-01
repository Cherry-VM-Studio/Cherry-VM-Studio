import { Button, Flex, Group, Text } from "@mantine/core";
import { Dropzone, FileRejection, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { IconFileTypeCsv, IconUpload, IconX } from "@tabler/icons-react";
import { useRef } from "react";
import SpreadsheetImportTable from "../../tables/SpreadsheetImportTable/SpreadsheetImportTable";
import dummyUsersSpreadsheet from "./dummyUsersSpreadsheet";
import classes from "./UploadSpreadsheetForm.module.css";

export interface UploadSpreadsheetFormProps {
    onUpload: (file: FileWithPath) => void;
    onReject: (file: FileRejection) => void;
}

const MAX_CSV_SIZE = 10 * 1024 * 1024; // 10MiB

const UploadSpreadsheetForm = ({ onUpload, onReject }: UploadSpreadsheetFormProps): React.JSX.Element => {
    const openRef = useRef<() => void>(null);

    return (
        <Group className={classes.container}>
            <Flex className={classes.item}>
                <Dropzone
                    acceptColor="lime.6"
                    accept={[MIME_TYPES.csv]}
                    multiple={false}
                    maxFiles={1}
                    onDrop={(files) => onUpload(files[0])}
                    onReject={(files) => onReject(files[0])}
                    maxSize={MAX_CSV_SIZE}
                    classNames={{ root: classes.dropzone, inner: classes.dropzoneInner }}
                    activateOnClick={false}
                    openRef={openRef}
                >
                    <Group className={classes.dropzoneLabelGroup}>
                        <Dropzone.Accept>
                            <IconUpload
                                size={52}
                                color="var(--mantine-color-lime-5)"
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                size={52}
                                color="var(--mantine-color-cherry-6)"
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFileTypeCsv
                                size={52}
                                color={"white"}
                                stroke={1.5}
                            />
                        </Dropzone.Idle>

                        <div>
                            <Text
                                size="xl"
                                inline
                                c="white"
                            >
                                Drag your CSV spreadsheet here
                            </Text>
                            <Text
                                size="sm"
                                inline
                                mt={7}
                                c="dark.1"
                            >
                                File should not exceed 10MB
                            </Text>
                        </div>
                    </Group>
                    <Button
                        className={classes.dropzoneButton}
                        onClick={() => openRef.current?.()}
                    >
                        Upload file
                    </Button>
                </Dropzone>
            </Flex>
            <Flex className={classes.item}>
                <SpreadsheetImportTable
                    headers={["name", "surname", "email", "username", "password", "account_type", "memberships"]}
                    records={dummyUsersSpreadsheet}
                    readOnly
                />
            </Flex>
        </Group>
    );
};

export default UploadSpreadsheetForm;
