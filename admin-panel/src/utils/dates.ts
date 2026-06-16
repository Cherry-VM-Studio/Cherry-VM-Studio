import i18n from "../config/translation.config";

export const timePassedRounded = (pastDate: Date) => {
    if (!pastDate) return [null, null];

    const thresholds = Object.entries({
        seconds: 60,
        minutes: 60,
        hours: 24,
    });

    const now = new Date();
    let diff = Math.max(Math.floor((now.getTime() - pastDate.getTime()) / 1000), 0);

    for (const [unit, threshold] of thresholds) {
        if (diff < threshold) return [diff, unit];
        diff = Math.floor(diff / threshold);
    }

    return [diff, "days"];
};

export const timeSince = (pastDate: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

    const hours = String(Math.floor(diffInSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((diffInSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(diffInSeconds % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
};

export const formatDate = (date: Date) => {
    const locale = i18n.language;

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString(locale, { month: "short" });
    const year = date.getFullYear();

    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year}, ${hour}:${minute}`;
};
