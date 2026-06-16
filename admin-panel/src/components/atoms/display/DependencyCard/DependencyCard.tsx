import { Card, CardProps, Flex, Group, Image, Text } from "@mantine/core";
import classes from "./DependencyCard.module.css";
import { Dependency } from "../../../../types/config.types";
import cs from "classnames";
import { IconLicense } from "@tabler/icons-react";

export interface DependencyCardProps extends CardProps {
    dependency: Dependency;
}

const DependencyCard = ({ dependency, className, ...props }: DependencyCardProps): React.JSX.Element => {
    return (
        <Card
            miw={350}
            className={cs(className, classes.dependencyCard)}
            {...props}
        >
            <Group
                justify="space-between"
                gap="xl"
            >
                <Group>
                    <Image
                        src={dependency.logo}
                        h="2rem"
                        w="2rem"
                        fit="contain"
                    />
                    <Text fw="500">{dependency.name}</Text>
                </Group>
                <Group
                    gap="6"
                    h="100%"
                    align="center"
                >
                    {dependency.links.map(({ url, icon: Icon }, i) => (
                        <Flex
                            component="a"
                            href={url}
                            key={i}
                        >
                            <Icon />
                        </Flex>
                    ))}
                    <Flex
                        component="a"
                        href={dependency.license.name}
                    >
                        <IconLicense />
                    </Flex>
                </Group>
            </Group>
        </Card>
    );
};

export default DependencyCard;
