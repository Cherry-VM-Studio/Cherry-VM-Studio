import { Avatar, Badge, Group, Skeleton, Stack } from "@mantine/core";
import classes from "./AccountHeading.module.css";
import { useTranslation } from "react-i18next";

const AccountHeadingPlaceholder = (): React.JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <Group className={classes.group}>
                <Skeleton
                    circle
                    height="96"
                />
                <Stack className={classes.userInfo}>
                    <Skeleton
                        height={24}
                        width={200}
                    />
                    <Skeleton
                        height={16}
                        width={200}
                    />
                </Stack>
                <Skeleton
                    height={24}
                    width={100}
                />
            </Group>
        </>
    );
};

export default AccountHeadingPlaceholder;
