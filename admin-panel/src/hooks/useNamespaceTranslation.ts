import { useTranslation } from "react-i18next";

interface useNamespaceTranslationReturns {
    tns: Function; // calls translation function with namespace previously set
    t: Function; // i18next translation function
}

const useNamespaceTranslation = (namespace: string, prefix: string = ""): useNamespaceTranslationReturns => {
    const { t } = useTranslation();

    if (prefix.length && !prefix.endsWith(".")) prefix += ".";

    const getKeysWithPrefix = (keys: string | Array<string>) => [keys].flat().map(key => `${prefix}${key}`);

    return {
        tns: (keys: string | Array<string>, options?: Object) => t(getKeysWithPrefix(keys), { ns: namespace, ...options }),
        t: t,
    };
};

export default useNamespaceTranslation;
