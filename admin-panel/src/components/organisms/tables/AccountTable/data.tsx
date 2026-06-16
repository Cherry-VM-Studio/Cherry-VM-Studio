import { values } from "lodash";
import { UserExtended } from "../../../../types/api.types";

export const prepareData = (accounts: Record<string, UserExtended>) =>
    values(accounts).map((user) => ({
        uuid: user.uuid,
        roles: user.account_type === "administrative" ? values(user.roles).map((r) => r.name) : [],
        groups: user.account_type === "client" ? values(user.groups).map((g) => g.name) : [],
        lastActive: user.last_active,
        details: {
            username: user.username,
            name: user.name,
            surname: user.surname,
            email: user.email,
        },
    }));
