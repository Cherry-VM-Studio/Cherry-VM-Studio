import { ScrollArea, ScrollAreaProps } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';
import classes from './FadingScroll.module.css';

/**
 * Mantine Scroll Area component with a fade effect near the bottom of the scrollable area.
 * When the user is not scrolled to the end of the content, a fade is applied.
 */
export default function FadingScroll(props: ScrollAreaProps) : React.ReactElement {
    const viewport = useRef(null);
    const [faded, setFaded] = useState<boolean>(true);
    const { height, width } = useViewportSize(); // website window width and height

    const isNearScrollEnd = () => {
        const areaHeight = viewport.current.scrollHeight - viewport.current.clientHeight; 
        const scrolled = viewport.current.scrollTop; 
        return Math.abs(scrolled - areaHeight) < 30; // if lower than 30px then its close enough to the end to not fade
    }

    const onScrollPositionChange = () => setFaded(!isNearScrollEnd());

    useEffect(() => {
        if(viewport.current.scrollHeight == viewport.current.clientHeight) setFaded(false);
        else if(!isNearScrollEnd()) setFaded(true);
    }, [height, width])

    return (
        <ScrollArea
            {...props}
            className={`${classes.scrollArea} ${faded ? '' : classes.noFade}`}
            onScrollPositionChange={onScrollPositionChange}
            viewportRef={viewport}
            type="always"
            offsetScrollbars
        >
            {props.children}
        </ScrollArea>
    )
}
