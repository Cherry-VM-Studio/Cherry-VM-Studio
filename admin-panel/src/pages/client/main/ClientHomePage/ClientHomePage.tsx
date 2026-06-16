import { Group, Image, Stack, Text } from "@mantine/core";
import classes from "./ClientHomePage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import GreetingTitle from "../../../../components/atoms/display/GreetingTitle/GreetingTitle";
import ProfileOverview from "../../../../components/organisms/display/ProfileOverview/ProfileOverview";
import MachinesOverview from "../../../../components/organisms/display/MachinesOverview/MachinesOverview";

const ClientHomePage = (): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "client-home");

    return (
        <Stack className={classes.container}>
            <Group
                mb="auto"
                w="100%"
                gap="xl"
                // justify="space-between"
            >
                <Image
                    src="/logos/CVMS/Cherry VM Studio Logo Small.webp"
                    w="100px"
                />
                <Stack>
                    <GreetingTitle />
                    <Text className={classes.description}>{tns("description1")}</Text>
                </Stack>
            </Group>
            <ProfileOverview />
            <MachinesOverview />
        </Stack>
    );
};

export default ClientHomePage;
