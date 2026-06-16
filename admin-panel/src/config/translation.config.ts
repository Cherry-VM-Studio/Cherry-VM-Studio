import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .use(Backend)
    .init({
        load: 'languageOnly',
        ns: [
            'common',
            'errors',
            'pages',
            'notifications',
            'layouts',
            'modals'
        ],
        fallbackLng: 'en',
        fallbackNS: 'common',
        defaultNS: 'common',
        // saveMissing: true, // Logs missing keys
        // debug: true,
        interpolation: {
            escapeValue: false // react already safes from xss
        },
    });

i18n.services.formatter.add('capitalize', (value, lng, options) => {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);;
});

i18n.services.formatter.add('lowercase', (value, lng, options) => {
    return value.toLowerCase();
});

export default i18n;