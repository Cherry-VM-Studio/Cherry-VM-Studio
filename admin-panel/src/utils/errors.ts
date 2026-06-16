import { ErrorCode } from "../config/errors.config";

export class RouteError extends Error {
    status: number;

    constructor(status: ErrorCode, message: string = "") {
        super(message);
        this.status = status;
    }
}
