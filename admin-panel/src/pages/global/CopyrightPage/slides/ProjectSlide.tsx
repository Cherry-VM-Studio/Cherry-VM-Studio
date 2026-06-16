import { Box, Flex, Stack, Text, Title, rem } from "@mantine/core";
import classes from "../CopyrightPage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { CopyrightPageSlideProps } from "../CopyrightPage";
import { Trans } from "react-i18next";
import AsciiArt from "../../../../components/atoms/display/AsciiArt/AsciiArt";
import { CC_BY_NC_ND_4_0 } from "../Licenses";
import hey_cvms from "../../../../assets/images/hey cvms hows it going.png";
import pet_the_cvms from "../../../../assets/images/pet the cvms.gif";
import confused_cat from "../../../../assets/ascii/confused_cat";
import pointing from "../../../../assets/ascii/pointing";
import _, { random } from "lodash";

const ProjectSlide = ({ slide, setSlide, ...props }: CopyrightPageSlideProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("pages", "credits");

    const imageNumber = random(0, 50);

    const easterEgg =
        imageNumber === 0 ? (
            <img
                src={hey_cvms}
                height="480px"
            />
        ) : imageNumber === 1 ? (
            <img
                src={pet_the_cvms}
                height="300px"
            />
        ) : _.inRange(imageNumber, 2, 15) ? (
            <AsciiArt
                text={pointing}
                label="Image of a shocked soyjak character pointing behind him."
                style={{ lineHeight: 1.25, transform: "translateY(-20%) scale(0.9)" }}
            />
        ) : (
            <AsciiArt
                text={confused_cat}
                label="Image of a confused cat"
                style={{ lineHeight: 1.25 }}
            />
        );

    return (
        <Stack
            id="project"
            className={classes.project}
            {...props}
        >
            <Title
                order={1}
                ff="poppins"
            >
                © {tns("project.title")}
            </Title>
            <Text className={classes.description}>
                {tns("project.description.1")}
                {CC_BY_NC_ND_4_0}
            </Text>
            <Box className={classes.description}>
                <Trans
                    i18nKey="pages:credits.project.description.2"
                    components={{
                        branding: (
                            <span
                                onClick={() => setSlide(1)}
                                className={classes.fakeAnchor}
                            />
                        ),
                        thirdParty: (
                            <span
                                onClick={() => setSlide(2)}
                                className={classes.fakeAnchor}
                            />
                        ),
                    }}
                />
            </Box>
            <Flex
                mt="auto"
                justify="end"
            >
                {easterEgg}
            </Flex>
        </Stack>
    );
};

export default ProjectSlide;
