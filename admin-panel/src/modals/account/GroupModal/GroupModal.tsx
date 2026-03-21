import { Avatar, Group, Modal, Stack, Text } from "@mantine/core";
import useFetch from "../../../hooks/useFetch";
import { IconUsersGroup } from "@tabler/icons-react";
import MembersTable from "../../../components/organisms/tables/MembersTable/MembersTable";
import classes from "./GroupModal.module.css";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { Client, GroupExtended } from "../../../types/api.types";
import ModifiableText from "../../../components/atoms/interactive/ModifiableText/ModifiableText";
import GroupModalPlaceholder from "./GroupModalPlaceholder";
import _, { values } from "lodash";
import AddClientsSelect from "../../../components/molecules/interactive/AddClientsSelect/AddClientsSelect";

const GroupModal = ({ opened, onClose, uuid, refreshTable = () => undefined }): React.JSX.Element => {
    const { data: group, loading, error, refresh: refreshModal } = useFetch<GroupExtended>(uuid ? `/groups/group/${uuid}` : undefined);
    const { tns, t } = useNamespaceTranslation("modals", "group");
    const { sendRequest } = useApi();

    const refresh = () => {
        refreshTable();
        refreshModal();
    };

    const removeMember = async (member: string) => {
        await sendRequest("PUT", `groups/leave/${uuid}`, { data: [member] });
        refresh();
    };

    const addMember = async (member: string) => {
        await sendRequest("PUT", `groups/join/${uuid}`, { data: [member] });
        refresh();
    };

    const renameGroup = async (new_name: string) => {
        await sendRequest("PATCH", `groups/rename/${uuid}`, { data: { name: new_name } });
        refresh();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
        >
            {!group && loading ? (
                <GroupModalPlaceholder />
            ) : (
                <Stack
                    align="center"
                    h="560"
                    p="md"
                    pt="0"
                    gap="xl"
                >
                    <Group
                        w="100%"
                        mb="sm"
                        h="100"
                    >
                        <Avatar
                            color="cherry"
                            size="xl"
                        >
                            <IconUsersGroup size={48} />
                        </Avatar>
                        {group && (
                            <Stack gap="0">
                                <ModifiableText
                                    value={group?.name}
                                    className={classes.title}
                                    editContainerClassName={classes.titleEdit}
                                    onSave={renameGroup}
                                />
                                <Text c="dimmed">{tns("client-count", { count: _.size(group.users) })}</Text>
                            </Stack>
                        )}
                    </Group>
                    <Stack
                        w="100%"
                        flex="1"
                        gap="42"
                        mih="0"
                    >
                        <AddClientsSelect
                            excludedClients={values(group?.users).map((user: Client) => user.uuid)}
                            onSubmit={addMember}
                            classNames={{ input: "borderless" }}
                        />
                        <MembersTable
                            usersData={values(group?.users)}
                            removeMember={removeMember}
                            loading={loading}
                            error={error}
                        />
                    </Stack>
                </Stack>
            )}
        </Modal>
    );
};

export default GroupModal;
