import { notifications, NotificationsProps } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { NotificationProps } from "@mantine/core";
import { ErrorCode, ExpandedErrorCode } from "../config/errors.config";
import { isArray } from "lodash";

export interface SendNotificationOptions {
    color?: string | null;
    loading?: boolean;
    uniqueId?: boolean;
}

export const useMantineNotifications = () => {
    const { t } = useTranslation();
    const format = (keys: string[] | string, interpolatedValues = {}) => t(keys, { ns: "notifications", ...interpolatedValues });

    // by using getSeconds we ensure that if multiple notifications of the same id
    // are to be sent in a short amount of time (same second)
    // only one of them will be sent as they will have the same id
    const getUniqueId = (id: string | number) => `${id}${new Date().getSeconds()}`;

    const sendNotification = (
        key: string,
        options: SendNotificationOptions | undefined = {},
        interpolatedValues: object | undefined = {},
        customProps = {},
    ) => {
        const notificationId = options.uniqueId ? getUniqueId(key) : key;

        notifications.show({
            id: notificationId,
            color: options.color || "suse-green",
            loading: options.loading || false,
            title: format(`${key}.title`, interpolatedValues),
            message: format(`${key}.message`, interpolatedValues),

            ...customProps,
        });

        return () => notifications.hide(notificationId);
    };

    const sendErrorNotification = (error: ErrorCode | ExpandedErrorCode, interpolatedValues = {}) => {
        const [code, variant] = isArray(error) ? error : [error, undefined];

        const notificationId = getUniqueId([code, variant].filter((e) => e).join("-"));
        const key = variant ? `${code}.variants.${variant}` : `${code}`;

        notifications.show({
            id: notificationId,
            withCloseButton: true,
            loading: false,
            autoClose: 20000,
            className: "error-class",
            color: "red",
            icon: <IconX />,
            title: format(`error.${key}.title`, interpolatedValues),
            message: format(`error.${key}.message`, interpolatedValues),
        });

        return () => notifications.hide(notificationId);
    };

    return {
        sendNotification,
        sendErrorNotification,
    };
};

export default useMantineNotifications;
