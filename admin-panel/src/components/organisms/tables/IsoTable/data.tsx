import { values } from "lodash";
import { IsoFile } from "../../../../types/api.types";

export const prepareData = (isoFiles: Record<string, IsoFile>) =>
    values(isoFiles).map(({ imported_at, last_modified_at, ...fields }) => ({
        ...fields,
        imported_at: imported_at ? new Date(`${imported_at}Z`) : null,
        last_modified_at: last_modified_at ? new Date(`${last_modified_at}Z`) : null,
    }));
