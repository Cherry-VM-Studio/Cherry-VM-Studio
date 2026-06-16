import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import BusinessCard from "../../../atoms/display/BusinessCard/BusinessCard";
import { isNull, values } from "lodash";
import { getFullUserName } from "../../../../utils/users";
import BadgeGroup from "../../../atoms/display/BadgeGroup/BadgeGroup";
import { formatDate } from "../../../../utils/dates";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import classes from "./ProfileOverview.module.css";
import useFetch from "../../../../hooks/useFetch";
import { UserExtended } from "../../../../types/api.types";

const ProfileOverview = (): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "client-home");
    const { data: user, loading, error } = useFetch<UserExtended>("/users/me");

    return (
        <>
            <Stack className={classes.overviewContainer}>
                <Group className={classes.overviewControls}>
                    <Title
                        order={2}
                        c="white"
                    >
                        {tns("your-profile")}
                    </Title>
                </Group>
                <Paper className={classes.overviewPaper}>
                    <Group
                        gap="xl"
                        wrap="nowrap"
                    >
                        <BusinessCard
                            name={isNull(user) ? t("loading") : getFullUserName(user)}
                            comment={user?.username ?? t("loading")}
                            size="lg"
                            avatarSize="lg"
                        />
                        <BadgeGroup
                            items={values(user?.groups).map((group) => group.name) ?? []}
                            maw="fit-content"
                        />
                        <Text c="dimmed">{`${t("created")} ${isNull(user) ? "-" : formatDate(new Date(user.creation_date))}`}</Text>
                    </Group>
                </Paper>
            </Stack>
        </>
    );
};

export default ProfileOverview;
