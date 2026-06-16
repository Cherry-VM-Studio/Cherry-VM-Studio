import { values } from "lodash";
import { Group } from "../../../../types/api.types";

export const prepareData = (groups: Record<string, Group>) =>
    values(groups).map(({ uuid, name, users }) => ({
        uuid,
        details: name,
        count: users.length,
        users,
    }));
