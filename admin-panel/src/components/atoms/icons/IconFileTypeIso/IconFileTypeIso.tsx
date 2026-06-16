import * as React from "react";
import { IconProps } from "@tabler/icons-react"; // gives you consistent props (size, stroke, color, etc.)

const IconFileTypeIso = ({ size = 24, stroke = 2, color = "currentColor", ...rest }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
    >
        <path d="M14,3v4c0,.6.4,1,1,1h4" />
        <path d="M5,12v-7c0-1.1.9-2,2-2h7l5,5v4" />
        <path d="M5.8,15v6" />
        <path d="M16.7,15c.8,0,1.5.7,1.5,1.5v3c0,.8-.7,1.5-1.5,1.5s-1.5-.7-1.5-1.5v-3c0-.8.7-1.5,1.5-1.5Z" />
        <path d="M9.1,20.2c0,.4.3.8.8.8h1.2c.6,0,1-.4,1-1v-1c0-.6-.4-1-1-1h-1c-.6,0-1-.4-1-1v-1c0-.6.4-1,1-1h1.2c.4,0,.8.3.8.8" />
    </svg>
);

export default IconFileTypeIso;
