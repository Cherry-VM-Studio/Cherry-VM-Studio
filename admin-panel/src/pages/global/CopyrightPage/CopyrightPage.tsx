import { ActionIcon, Group, ScrollArea, Stack, StackProps, Text } from "@mantine/core";
import classes from "./CopyrightPage.module.css";
import { useTranslation } from "react-i18next";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import ProjectSlide from "./slides/ProjectSlide";
import BrandingSlide from "./slides/BrandingSlide";
import ThirdPartySlide from "./slides/ThirdPartySlide";

export interface CopyrightPageSlideProps extends StackProps {
    slide: number;
    setSlide: React.Dispatch<React.SetStateAction<number>>;
}

const CopyrightPage = () => {
    const [slide, setSlide] = useState(0);
    const { t } = useTranslation();

    const slides = [ProjectSlide, BrandingSlide, ThirdPartySlide];

    return (
        <Stack className={classes.container}>
            <ScrollArea
                className={classes.scrollArea}
                classNames={{ content: "auto-width full-height" }}
            >
                {slides.map((Slide, i) => (
                    <Slide
                        key={i}
                        display={slide !== i ? "none" : undefined}
                        slide={slide}
                        setSlide={setSlide}
                    />
                ))}
            </ScrollArea>
            <Group
                mt="auto"
                gap="xs"
            >
                <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={() => setSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                >
                    <IconChevronLeft
                        size={18}
                        stroke={3}
                    />
                </ActionIcon>
                <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={() => setSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
                >
                    <IconChevronRight
                        size={18}
                        stroke={3}
                    />
                </ActionIcon>
                <Text ml="sm">
                    {slide + 1} / {slides.length}
                </Text>
            </Group>
        </Stack>
    );
};

export { CopyrightPage as default };
