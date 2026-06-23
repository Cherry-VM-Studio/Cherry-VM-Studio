import { values } from "lodash";
import { Group, GroupExtended } from "../../../../types/api.types";

export const prepareData = (groups: Record<string, GroupExtended>) =>
    values(groups).map(({ uuid, name, users }) => ({
        uuid,
        details: name,
        count: users.length,
        users: values(users),
    }));
