import classes from './StateDivider.module.css';
import React from 'react'
import { Container, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { StateDividerProps } from '../../../../types/components.types';

const StateDivider = ({ label } : StateDividerProps) => {
    const { t } = useTranslation();

    return (
        <Container className={classes.mainContainer}>
            <Divider label={t(label).toUpperCase()} classNames={{
                root: classes.dividerRoot,
                label: `${classes.labelText} ${classes[label]}`
            }} />
        </Container>
    )
}

export default StateDivider;
