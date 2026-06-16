import { Group } from "@mantine/core";
import React from "react";
import LanguageSwitch from "../../../molecules/interactive/LanguageSwitch/LanguageSwitch";
import NavButton from "../../../atoms/interactive/NavButton/NavButton";
import { IconAddressBook, IconBook2, IconBrandGithub, IconCopyright, IconHome } from "@tabler/icons-react";
import { projectLinks } from "../../../../config/project.config";
import { Link } from "react-router-dom";

const HomeHeader = (): React.JSX.Element => (
    <Group
        w="100%"
        justify="space-between"
        pl="xs"
        pr="xs"
    >
        <Group justify="flex-end">
            {/* <NavButton component={Link} to='/' icon={<IconHome />} />
            <NavButton component={Link} to='/credits' icon={<IconAddressBook />}/>
            <NavButton component={Link} to='/copyright' icon={<IconCopyright />}/> */}
        </Group>
        <Group justify="flex-end">
            <LanguageSwitch position="bottom" />
            <NavButton
                component="a"
                href={projectLinks.documentation}
                icon={<IconBook2 />}
            />
            <NavButton
                component="a"
                href={projectLinks.github}
                icon={<IconBrandGithub />}
            />
        </Group>
    </Group>
);

export default HomeHeader;
