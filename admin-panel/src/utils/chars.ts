export const encodeCharacters = (value?: string) => {
    if (!value) return "";

    // If printable ASCII, return as-is
    if (/^[\x20-\x7E]$/.test(value)) return value;

    // Otherwise escape using JSON
    return JSON.stringify(value).slice(1, -1);
};

export const decodeCharacters = (value: string) => {
    try {
        return JSON.parse(`"${value}"`);
    } catch {
        return value;
    }
};
