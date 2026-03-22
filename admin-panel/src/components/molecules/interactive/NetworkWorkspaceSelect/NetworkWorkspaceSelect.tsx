import { Avatar, Group, Text, Combobox, InputBase, useCombobox, Badge, Box, ThemeIcon, Input, ScrollArea } from "@mantine/core";
import { IconNetwork, IconEye, IconTopologyStarRing3, IconChevronDown } from "@tabler/icons-react";
import useFetch from "../../../../hooks/useFetch";
import { AdministratorExtended } from "../../../../types/api.types";
import React, { useMemo, useState, useEffect } from "react";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import PERMISSIONS from "../../../../config/permissions.config";
import _ from "lodash";
import { getFullUserName } from "../../../../utils/users";
import { useTranslation } from "react-i18next";
import { useProfile } from "../../../../contexts/ProfileContext";
import classes from "./NetworkWorkspaceSelect.module.css";
import cs from "classnames";
import { useDisclosure } from "@mantine/hooks";
import ConfirmationModal from "../../../../modals/base/ConfirmationModal/ConfirmationModal";

export interface NetworkWorkspaceSelectProps {
    selectedAccountUuid: string;
    setSelectedAccountUuid: React.Dispatch<React.SetStateAction<string>>;
    isDirty: boolean;
    [key: string]: any;
}

const ITEMS_PER_PAGE = 20;

const NetworkWorkspaceSelect = ({ selectedAccountUuid, setSelectedAccountUuid, isDirty, ...props }: NetworkWorkspaceSelectProps): React.JSX.Element => {
    const { data: users, loading, error } = useFetch<Record<string, AdministratorExtended>>("/users/all?account_type=administrative");
    const { hasPermissions } = usePermissions();
    const { getProfile } = useProfile();
    const { t } = useTranslation();
    const combobox = useCombobox();
    const [search, setSearch] = useState("");
    const [pendingValue, setPendingValue] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const currentUserUuid = getProfile()?.uuid;
    const canManage = hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    // Convert users to options array with enhanced metadata
    const optionsData = useMemo(
        () =>
            _.values(users)
                .map((user) => ({
                    value: user.uuid,
                    label: user.uuid === currentUserUuid ? t("my-environment") : `${getFullUserName(user)}`,
                    subtitle: user.uuid === currentUserUuid ? t("your-environment") : t("environment"),
                    isCurrentUser: user.uuid === currentUserUuid,
                    fullName: getFullUserName(user),
                    username: user.username,
                }))
                .sort((a) => (a.isCurrentUser ? -1 : 0)),
        [users, currentUserUuid, t],
    );

    // Filter options based on search
    const filteredOptions = useMemo(() => {
        if (!search) return optionsData;
        const searchLower = search.toLowerCase();
        return optionsData.filter(
            (option) =>
                option.fullName.toLowerCase().includes(searchLower) ||
                option.label.toLowerCase().includes(searchLower) ||
                option.username?.toLowerCase().includes(searchLower),
        );
    }, [optionsData, search]);

    // Determine which options to show based on search state and visible count
    const visibleOptions = useMemo(() => {
        if (search) return filteredOptions;
        return filteredOptions.slice(0, visibleCount);
    }, [filteredOptions, visibleCount, search]);

    const hasMore = !search && visibleCount < filteredOptions.length;
    const remainingCount = filteredOptions.length - visibleCount;

    // Reset visible count when search changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [search, opened]);

    const selectedOption = optionsData.find((option) => option.value === selectedAccountUuid);

    const handleOptionSubmit = (value: string) => {
        // Ignore if it's the load-more pseudo-option
        if (value === "load-more") return;

        if (isDirty) {
            setPendingValue(value);
            combobox.closeDropdown();
            open();
        } else executeWorkspaceSwitch(value);
    };

    const executeWorkspaceSwitch = (value: string) => {
        setSelectedAccountUuid(value);
        setSearch("");
        setVisibleCount(ITEMS_PER_PAGE);
        combobox.closeDropdown();
        setPendingValue(null);
    };

    const handleConfirm = () => {
        if (pendingValue) {
            executeWorkspaceSwitch(pendingValue);
        }
        close();
    };

    const handleCancel = () => {
        setPendingValue(null);
        close();
    };

    const loadMore = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event bubbling
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    };

    // Enhanced render function with network-themed design
    const renderWorkspaceOption = (option: (typeof optionsData)[0], isSelected = false) => {
        const isCurrentWorkspace = option.isCurrentUser;

        return (
            <Group
                gap="xs"
                wrap="nowrap"
                style={{ width: "100%" }}
            >
                <Avatar
                    alt={option.fullName}
                    name={option.fullName}
                    color={isCurrentWorkspace ? "green" : "blue"}
                    size="sm"
                    radius="sm"
                >
                    {!option.fullName && <IconNetwork size={16} />}
                </Avatar>

                <Box style={{ flex: 1 }}>
                    <Group
                        justify="space-between"
                        wrap="nowrap"
                    >
                        <Text
                            size="sm"
                            fw={isCurrentWorkspace ? 600 : 400}
                            style={{ textWrap: "nowrap", textOverflow: "ellipsis" }}
                        >
                            {option.label}
                        </Text>
                    </Group>
                    <Text
                        size="xs"
                        c="dimmed"
                        style={{ textWrap: "nowrap", textOverflow: "ellipsis" }}
                    >
                        @{option.username} • {option.subtitle}
                    </Text>
                </Box>

                {isSelected && (
                    <ThemeIcon
                        size="sm"
                        radius="xl"
                        color="gray"
                        variant="light"
                    >
                        <IconEye size={12} />
                    </ThemeIcon>
                )}
            </Group>
        );
    };

    const renderSelectedWorkspace = () => {
        if (!selectedOption) {
            return <Input.Placeholder>{props.placeholder || t("select-workspace")}</Input.Placeholder>;
        }

        const isCurrentWorkspace = selectedOption.isCurrentUser;

        return (
            <Group
                gap="xs"
                wrap="nowrap"
            >
                <IconTopologyStarRing3 size="20" />
                <Box style={{ flex: 1, overflow: "hidden" }}>
                    <Text
                        size="sm"
                        fw={500}
                        truncate
                        style={{ textWrap: "nowrap", textOverflow: "ellipsis" }}
                    >
                        {selectedOption.label}
                    </Text>
                </Box>
                {isCurrentWorkspace && (
                    <Badge
                        size="xs"
                        color="green"
                        variant="light"
                        radius="sm"
                    >
                        {t("current")}
                    </Badge>
                )}
            </Group>
        );
    };

    return (
        <>
            <Combobox
                store={combobox}
                onOptionSubmit={handleOptionSubmit}
                disabled={!canManage}
                withinPortal
            >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        pointer
                        onClick={() => combobox.toggleDropdown()}
                        rightSection={<Combobox.Chevron />}
                        disabled={!canManage}
                        w="350"
                        {...props}
                        classNames={{
                            ...props.classNames,
                            input: cs(classes.input, props?.classNames?.input, classes.networkInput),
                        }}
                    >
                        {renderSelectedWorkspace()}
                    </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                    <Combobox.Search
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder={t("search")}
                        mb="xs"
                        classNames={{ input: "borderless" }}
                    />

                    <ScrollArea.Autosize
                        mah={350}
                        type="auto"
                        offsetScrollbars
                        scrollbarSize="0.525rem"
                    >
                        <Combobox.Options>
                            {loading && (
                                <Combobox.Option
                                    value="loading"
                                    disabled
                                >
                                    <Group gap="xs">
                                        <ThemeIcon
                                            size="sm"
                                            variant="light"
                                        >
                                            <IconNetwork size={14} />
                                        </ThemeIcon>
                                        <Text size="sm">{t("loading-users")}</Text>
                                    </Group>
                                </Combobox.Option>
                            )}

                            {error && !loading && (
                                <Combobox.Option
                                    value="error"
                                    disabled
                                >
                                    <Text
                                        size="sm"
                                        c="red"
                                    >
                                        {t("error-users")}
                                    </Text>
                                </Combobox.Option>
                            )}

                            {!loading && !error && filteredOptions.length === 0 && (
                                <Combobox.Option
                                    value="nothing"
                                    disabled
                                >
                                    <Text
                                        size="sm"
                                        c="dimmed"
                                    >
                                        {t("nothing-found")}
                                    </Text>
                                </Combobox.Option>
                            )}

                            {!loading &&
                                !error &&
                                visibleOptions.map((option) => (
                                    <Combobox.Option
                                        value={option.value}
                                        key={option.value}
                                        active={option.value === selectedAccountUuid}
                                    >
                                        {renderWorkspaceOption(option, option.value === selectedAccountUuid)}
                                    </Combobox.Option>
                                ))}

                            {hasMore && (
                                <Box
                                    onClick={loadMore}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Group
                                        gap="4"
                                        justify="center"
                                        py="xs"
                                        px="md"
                                    >
                                        <IconChevronDown
                                            size={18}
                                            stroke={3}
                                        />
                                        <Text
                                            size="sm"
                                            fw={500}
                                        >
                                            {t("load-more", { count: Math.min(ITEMS_PER_PAGE, remainingCount) })}
                                        </Text>
                                    </Group>
                                </Box>
                            )}
                        </Combobox.Options>
                    </ScrollArea.Autosize>
                </Combobox.Dropdown>
            </Combobox>

            <ConfirmationModal
                opened={opened}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={t("confirm.np-refresh.title", { ns: "modals" })}
                message={t("confirm.np-refresh.description", { ns: "modals" })}
                confirmButtonProps={{ color: "red.7" }}
            />
        </>
    );
};

export default NetworkWorkspaceSelect;
