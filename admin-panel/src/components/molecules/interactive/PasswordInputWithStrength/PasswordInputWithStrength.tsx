import { Box, PasswordInput, PasswordInputProps, Popover, Progress } from "@mantine/core";
import React, { useState } from "react";
import PasswordRequirement from "../../../atoms/feedback/PasswordRequirement/PasswordRequirement";

const passwordRequirements = [
    { re: /.{10,}/, label: "Includes at least 10 characters" },
    { re: /[0-9]/, label: "Includes number" },
    { re: /[a-z]/, label: "Includes lowercase letter" },
    { re: /[A-Z]/, label: "Includes uppercase letter" },
    { re: /[$&+,:;=?@#|'<>.^*()%!_-]/, label: "Includes special symbol" },
];

const getPasswordStrength = (password: string) =>
    (passwordRequirements.filter((requirement) => requirement.re.test(password)).length / passwordRequirements.length) * 100;

const PasswordInputWithStrength = ({ value, ...props }: PasswordInputProps): React.JSX.Element => {
    const [popoverOpened, setPopoverOpened] = useState<boolean>(false);

    const strength = getPasswordStrength(value as string);
    const color = strength === 100 ? "suse-green" : strength > 50 ? "yellow" : "cherry";
    const checks = passwordRequirements.map(({ label, re }, i) => (
        <PasswordRequirement
            key={i}
            label={label}
            meets={re.test(value as string)}
        />
    ));

    return (
        <Popover
            opened={popoverOpened && strength < 100}
            position="bottom"
            width="target"
            transitionProps={{ transition: "pop" }}
        >
            <Popover.Target>
                <Box
                    onFocusCapture={() => setPopoverOpened(true)}
                    onBlurCapture={() => setPopoverOpened(false)}
                >
                    <PasswordInput
                        {...props}
                        value={value}
                    />
                </Box>
            </Popover.Target>
            <Popover.Dropdown bd="2px solid var(--mantine-color-dark-5)">
                <Progress
                    color={color}
                    value={strength}
                    size={5}
                    mb="xs"
                />
                {checks}
            </Popover.Dropdown>
        </Popover>
    );
};

export default PasswordInputWithStrength;
