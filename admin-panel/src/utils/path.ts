import { trim } from "lodash";

export const validPath = (path = "") => `/${trim(path, "/")}`;

export const combinePaths = (...paths: string[]) => `/${paths.map((path) => trim(path, "/")).join("/")}`;
