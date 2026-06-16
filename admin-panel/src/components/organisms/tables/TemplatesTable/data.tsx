import { values } from "lodash";
import { MachineTemplate } from "../../../../types/api.types";

export const prepareData = (templates: Record<string, MachineTemplate>) =>
    values(templates).map(({ created_at, ...fields }) => ({
        ...fields,
        created_at: new Date(`${created_at}Z`),
    }));
