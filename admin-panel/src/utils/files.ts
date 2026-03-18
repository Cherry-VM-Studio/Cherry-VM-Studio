type ByteUnit = "B" | "KiB" | "MiB" | "GiB" | "TiB" | "PiB" | "EiB";

export const getRelevantUnit = (bytes: number): ByteUnit => {
    const k = 1024;
    const units: ByteUnit[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return units[i] || "B";
};

export const formatBytesToUnit = (bytes: number, unit: ByteUnit, decimals = 2): string => {
    const units: ByteUnit[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
    const index = units.indexOf(unit);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(decimals)}`;
};

export const formatBytesToUnitStringify = (bytes: number, unit: ByteUnit, decimals = 2): string => {
    return `${formatBytesToUnit(bytes, unit, decimals)} ${unit}`;
};

export const formatBytesToRelevantUnit = (bytes: number) => formatBytesToUnitStringify(bytes, getRelevantUnit(bytes));

export function toBytes(value: number, unit: ByteUnit): number {
    const multipliers: Record<ByteUnit, number> = {
        B: 1,
        KiB: 1024,
        MiB: 1024 ** 2,
        GiB: 1024 ** 3,
        TiB: 1024 ** 4,
        PiB: 1024 ** 5,
        EiB: 1024 ** 6,
    };

    return value * multipliers[unit];
}
