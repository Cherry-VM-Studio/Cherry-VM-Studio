import { ActionIconProps, ButtonProps } from "@mantine/core";
import { ComponentPropsWithoutRef } from "react";

export type MantineButtonAllProps = ButtonProps & ComponentPropsWithoutRef<"button">;

export type MantineActionIconAllProps = ActionIconProps & ComponentPropsWithoutRef<"button">;
