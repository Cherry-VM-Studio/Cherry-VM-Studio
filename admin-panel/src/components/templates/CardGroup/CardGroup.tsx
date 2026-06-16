import { useResizeObserver } from "@mantine/hooks";
import { Collapse, SimpleGrid, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import DummyCard from "../../organisms/MachineCard/DummyCard";
import CollapsibleGroupToggle from "../../molecules/interactive/CollapsibleGroupToggle/CollapsibleGroupToggle";
import { CardGroupProps } from "../../../types/components.types";
import { useEffect, useState } from "react";

/**
 * Groups machine cards or similar elements into a collapsible section with a toggle button.
 * The component automatically adjusts the number of columns in the grid layout based on the container width.
 * It displays a button labeled with the group name, which can be used to expand or collapse the group.
 */

const CardGroup = ({ children, group, opened, toggleOpened }: CardGroupProps): React.JSX.Element => {
    const { t } = useTranslation();
    const [containerRef, rect] = useResizeObserver();
    const numOfCols = Math.max(Math.floor(rect.width / 300), 1);

    const dummyChildren = Array.from({ length: children.length }, (_, i) => <DummyCard key={i} />);

    return (
        <Stack mr='xl' ref={containerRef}>
            <CollapsibleGroupToggle 
                toggleOpened={toggleOpened}
                opened={opened}
                label={t(group)}
            />

            <Collapse in={opened} ml='md'>
                <SimpleGrid cols={numOfCols}>
                    {opened ? children : dummyChildren}
                </SimpleGrid>
            </Collapse>
        </Stack>
    )
}

export default CardGroup;