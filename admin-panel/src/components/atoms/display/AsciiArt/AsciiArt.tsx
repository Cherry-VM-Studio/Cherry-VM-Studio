import { merge } from "lodash";
import React from "react";

export interface AsciiArtProps {
    text: string;
    label: string;
    caption?: React.JSX.Element | string;
    style: React.CSSProperties
}

const AsciiArt = ({ text, label, caption, style }: AsciiArtProps): React.JSX.Element => {
    return (
        <figure>
            <pre
                role="img"
                aria-label={label}
                style={merge({
                    whiteSpace: "pre",
                    fontFamily: "monospace",
                    lineHeight: "1",
                }, style)}
            >
                {text}
            </pre>
            <figcaption>{caption}</figcaption>
        </figure>
    );
};

export default AsciiArt;
