import { User, UserExtended } from "../types/api.types";

export const getFullUserName = (user: User | UserExtended) => (user.name || user.surname ? `${user.name} ${user.surname}`.trim() : user.username);
