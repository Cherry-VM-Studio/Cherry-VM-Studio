import { Group } from "@mantine/core";
import Navbar, { NavbarProps } from "../Navbar/Navbar";
import classes from "./DoubleNavbar.module.css";
import SecondBar from "../SecondBar/SecondBar";

export default function DoubleNavbar({ pages, ...props }: NavbarProps): React.ReactElement {
    return (
        <Group
            className={classes.container}
            gap={0}
        >
            <Navbar
                pages={pages}
                {...props}
            />
            <SecondBar pages={pages} />
        </Group>
    );
}
