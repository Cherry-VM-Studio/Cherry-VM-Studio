import _ from "lodash";
import { ValidationConfig } from "../../../components/organisms/forms/VerifySpreadsheetForm/VerifySpreadsheetForm";

const moreThanOnce = (arr: string[], str: string) => arr.indexOf(str) !== arr.lastIndexOf(str);

const incrementBase32 = (numStr: string) => {
    const alphabet = "0123456789abcdefghijklmnopqrstuv";
    let carry = 1;
    let result = "";

    for (let i = numStr.length - 1; i >= 0; i--) {
        let sum = alphabet.indexOf(numStr[i].toLowerCase()) + carry;
        carry = Math.floor(sum / 32);
        result = alphabet[sum % 32] + result;
    }

    if (carry) result = alphabet[carry] + result;

    while (result.length < 3) {
        result = "0" + result;
    }

    return result;
};

const resolveDuplicate = (val: string, maxChars: number, values: string[]): string => {
    const trimmed = val.slice(0, maxChars - 4);

    let id = "001";
    let newVal = `${trimmed}-${id}`;

    while (values.includes(newVal)) {
        id = incrementBase32(id);
        newVal = `${trimmed}-${id}`;
    }

    return newVal;
};

const generateUsername = (target: Record<string, string>, values: string[]) => {
    const name = (target?.name ?? "").replace(/[^a-zA-Z]/g, "").toLowerCase();
    const surname = (target?.surname ?? "").replace(/[^a-zA-Z]/g, "").toLowerCase();
    const email = (target?.email ?? "")
        .split("@")?.[0]
        ?.replace(/[^a-zA-Z]/g, "")
        .toLowerCase();

    let username = "";

    if (name && surname) username = `${name.slice(0, 10)}.${surname.slice(0, 10)}`;
    else if (name) username = name.slice(0, 20);
    else if (surname) username = surname.slice(0, 20);
    else if (email) username = email.slice(0, 20);
    else username = resolveDuplicate("account", 24, values);

    if (values.includes(username)) {
        username = resolveDuplicate(username, 24, values);
    }

    return username;
};

const generatePassword = (length = 12) => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const specials = "$&+,:;=?@#|'<>.^*()%!_-";

    length = _.clamp(length, 10, 256);

    const required = [_.sample(upper)!, _.sample(lower)!, _.sample(digits)!, _.sample(specials)!];

    const allChars = upper + lower + digits + specials;
    const remaining = _.times(length - required.length, () => _.sample(allChars)!);

    return _.shuffle([...required, ...remaining]).join("");
};

const VALIDATION = {
    name: [
        {
            key: "too-long",
            message: "Name length cannot exceed 50 characters.",
            autofixMessage: "Truncates the name to fit the length limits.",
            validate: (val) => val?.length > 50,
            autofix: (val) => {
                return val.slice(0, 50);
            },
        },
    ],
    surname: [
        {
            key: "too-long",
            message: "Surname length cannot exceed 50 characters.",
            autofixMessage: "Truncates the name to fit the length limits.",
            validate: (val) => val?.length > 50,
            autofix: (val) => {
                return val.slice(0, 50);
            },
        },
    ],
    username: [
        {
            key: "missing",
            message: "Username field missing.",
            autofixMessage: "Generates a username automatically from other properties such as name, surname, or email.",
            validate: (val) => _.isUndefined(val) || !val?.length,
            autofix: (_, target, values) => {
                return generateUsername(target, values);
            },
        },
        {
            key: "invalid-chars",
            message: "Username contains invalid characters. It may only contain lowercase letters, digits, underscores, periods and hyphens.",
            autofixMessage: "Generates a username automatically from other properties such as name, surname, or email.",
            validate: (val) => val && !/^[a-z0-9_\.-]*$/.test(val),
            autofix: (_, target, values) => {
                return generateUsername(target, values);
            },
        },
        {
            key: "invalid-first-char",
            message: "Username starts with a character other than a letter.",
            autofixMessage: "Generates a username automatically from other properties such as name, surname, or email.",
            validate: (val) => val && !/^[a-zA-Z]$/g.test(val?.charAt(0)),
            autofix: (_, target, values) => {
                return generateUsername(target, values);
            },
        },
        {
            key: "duplicate",
            message: "Duplicate username found.",
            autofixMessage: "Appends a tag to the end of the username. The username may be truncated to fit length limits.",
            validate: (val, _, values) => {
                return val && moreThanOnce(values, val);
            },
            autofix: (val, _, values) => {
                return resolveDuplicate(val, 24, values);
            },
        },
        {
            key: "too-short",
            message: "Username must be at least 3 characters long.",
            autofixMessage: "Appends a tag to the end of the username.",
            validate: (val) => val && val?.length < 3,
            autofix: (val, _, values) => {
                return resolveDuplicate(val, 24, values);
            },
        },
        {
            key: "too-long",
            message: "Username length cannot exceed 24 characters.",
            autofixMessage: "Truncates the username to fit the length limits. Might append a tag to the end of the username in case of a duplicate.",
            validate: (val) => val && val?.length > 24,
            autofix: (val, _, values) => {
                let trimmed = val.slice(0, 24);
                if (moreThanOnce(values, trimmed)) trimmed = resolveDuplicate(trimmed, 24, values);
                return trimmed;
            },
        },
    ],
    password: [
        {
            key: "too-short",
            message: "Password must be at least 12 characters long.",
            autofixMessage: "Generate a secure password.",
            validate: (val) => !val || val?.length < 12,
            autofix: () => generatePassword(16),
        },
        {
            key: "too-long",
            message: "Password length cannot exceed 256 characters.",
            autofixMessage: "Generate a secure password.",
            validate: (val) => val?.length > 256,
            autofix: () => generatePassword(16),
        },
        {
            key: "invalid-chars",
            message: "Password contains invalid characters",
            autofixMessage: "Generate a secure password.",
            validate: (val) => val && !/^[A-Za-z0-9$&+,:;=?@#|'<>.^*()%!_-]+$/.test(val),
            autofix: () => generatePassword(16),
        },
        {
            key: "not-safe",
            message: "Password must contain at least one digit, lowercase letter, upercase letter and one of the special characters.",
            autofixMessage: "Generate a secure password.",
            validate: (val) => val?.length > 256,
            autofix: () => generatePassword(16),
        },
    ],
    email: [
        {
            key: "invalid",
            message: "Provided email is invalid.",
            autofixMessage: "Erase invalid emails.",
            validate: (val) => val?.length && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(val),
            autofix: () => "",
        },
        {
            key: "duplicate",
            message: "Duplicate email found.",
            autofixMessage: "Erase duplicate emails.",
            validate: (val, _, values) =>
                val &&
                moreThanOnce(
                    values.map((e) => e?.toLowerCase()),
                    val.toLowerCase(),
                ),
            autofix: () => "",
        },
    ],
} as ValidationConfig;

export default VALIDATION;
