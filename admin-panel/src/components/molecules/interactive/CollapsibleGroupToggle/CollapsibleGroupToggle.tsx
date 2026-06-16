import { Button, Divider, Text } from "@mantine/core";
import { IconChevronDown, IconChevronRight, IconGripHorizontal } from "@tabler/icons-react";
import React from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { CollapsibleGroupToggleProps } from "../../../../types/components.types";
import classes from './CollapsibleGroupToggle.module.css';

const CollapsibleGroupToggle = ({toggleOpened, opened, label} : CollapsibleGroupToggleProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation('pages');

    return (
        <Button
            onClick={toggleOpened}
            classNames={{ root: classes.button, label: classes.buttonLabel }}
            aria-label={tns(`machine-list.groups.${opened ? 'collapse' : 'expand'}`)}
            variant='transparent'

            leftSection={
                opened ? <IconChevronDown className={classes.buttonIcon} /> 
                : <IconChevronRight className={classes.buttonIcon} />
            }
            rightSection={<IconGripHorizontal className={classes.buttonIcon} />}
        >
            <Divider
                classNames={{ root: classes.divider, label: classes.dividerLabel }}
                label={
                    <Text tt='capitalize' className={classes.dividerLabelText}>
                        {label}
                    </Text>
                }
            />
        </Button>
    );
}

export default CollapsibleGroupToggle;