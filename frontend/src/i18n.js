import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import esLanding from "./languages/es/landing.json";
import esAuth from "./languages/es/auth.json";
import esAppCommon from "./languages/es/app_common.json";
import esAppHome from "./languages/es/app_home.json";
import esAppTasks from "./languages/es/app_tasks.json";
import esAppCalendar from "./languages/es/app_calendar.json";
import esAppStatistics from "./languages/es/app_statistics.json";
import esAppTempleMode from "./languages/es/app_temple-mode.json";
import esAppSettingsAccount from "./languages/es/app_settings_account.json";
import esAppSettingsPreferences from "./languages/es/app_settings_preferences.json";
import esAppSettingsProductivity from "./languages/es/app_settings_productivity.json";

import enLanding from "./languages/en/landing.json";
import enAuth from "./languages/en/auth.json";
import enAppCommon from "./languages/en/app_common.json";
import enAppHome from "./languages/en/app_home.json";
import enAppTasks from "./languages/en/app_tasks.json";
import enAppCalendar from "./languages/en/app_calendar.json";
import enAppStatistics from "./languages/en/app_statistics.json";
import enAppTempleMode from "./languages/en/app_temple-mode.json";
import enAppSettingsAccount from "./languages/en/app_settings_account.json";
import enAppSettingsPreferences from "./languages/en/app_settings_preferences.json";
import enAppSettingsProductivity from "./languages/en/app_settings_productivity.json";

const resources = {
    es: {
        landing: esLanding,
        auth: esAuth,
        app_home: esAppHome,
        app_common: esAppCommon,
        app_tasks: esAppTasks,
        app_calendar: esAppCalendar,
        app_statistics: esAppStatistics,
        "app_temple-mode": esAppTempleMode,
        app_settings_account: esAppSettingsAccount,
        app_settings_preferences: esAppSettingsPreferences,
        app_settings_productivity: esAppSettingsProductivity,
    },
    en: {
        landing: enLanding,
        auth: enAuth,
        app_home: enAppHome,
        app_common: enAppCommon,
        app_tasks: enAppTasks,
        app_calendar: enAppCalendar,
        app_statistics: enAppStatistics,
        "app_temple-mode": enAppTempleMode,
        app_settings_account: enAppSettingsAccount,
        app_settings_preferences: enAppSettingsPreferences,
        app_settings_productivity: enAppSettingsProductivity,
    },
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        defaultNS: "landing",

        detection: {
            order: ["subdomain", "localStorage", "navigator"],
            lookupFromSubdomainIndex: 0,
            caches: ["localStorage"],
        },

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
