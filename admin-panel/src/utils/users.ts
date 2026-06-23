import _ from "lodash";
import { User, UserExtended } from "../types/api.types";

export const getFullUserName = (user: User | UserExtended) => (user.name || user.surname ? `${user.name} ${user.surname}`.trim() : user.username);

export const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "$&+,:;=?@#|'<>.^*()%!_-";
    const all = upper + lower + digits + special;

    const length = _.random(12, 16);

    const pick = (set: string) => _.sample(set);

    let password = [pick(upper), pick(lower), pick(digits), pick(special), ..._.times(length - 4, () => pick(all))];

    return _.shuffle(password).join("");
};
