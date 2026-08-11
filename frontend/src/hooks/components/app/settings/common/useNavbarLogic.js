/** React & Third-Party Libraries */
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Settings Navbar Logic Hook
 *
 * This Headless Component Hook abstracts the routing calculations and dynamic 
 * translation resolutions for the Settings `NavbarComponent`. By isolating the 
 * location watcher and routing arrays, it perfectly synchronizes the active tab 
 * with the browser URL while keeping the JSX strictly presentational.
 *
 * @hook
 * @returns {Object} A structured payload containing derived routing data required by the Settings Navbar UI.
 */
export const useNavbarLogic = () => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Translation Hook
     *
     * Provides the `t` function scoped to the "app_common" namespace to inject
     * localized text into the navigation interface dynamically.
     */
    const { t } = useTranslation("app_common");

    /**
     * Location Watcher Hook
     *
     * Subscribes to the React Router's location object to dynamically synchronize
     * the active navigation tab based on the current browser URL.
     */
    const location = useLocation();

    // --- 2. Derived UI Data ---

    /**
     * Navigation Options Configuration
     *
     * Memoized to prevent the continuous recreation of the navigation array on every
     * component re-render. Re-evaluates only when the translation instance `t` changes.
     */
    const navbarOptions = useMemo(
        () => [
            { icon: "IconUser", title: t("settings.navbar.account"), to: "/settings-account" },
            { icon: "IconSettings", title: t("settings.navbar.preferences"), to: "/settings-preferences" },
            { icon: "IconPyramid", title: t("settings.navbar.productivity"), to: "/settings-productivity" },
            { icon: "IconBell", title: t("settings.navbar.notifications"), to: "/settings-notifications" },
            { icon: "IconUsersGroup", title: t("settings.navbar.team"), to: "/settings-team" },
        ],
        [t],
    );

    /**
     * Active Tab Resolution
     *
     * Memoized calculation that maps the current browser URL path to the corresponding
     * title within the navigation configuration array. Prevents unnecessary array traversals
     * on irrelevant component re-renders.
     */
    const activeTab = useMemo(() => {
        const currentOption = navbarOptions.find((option) => option.to === location.pathname);
        return currentOption ? currentOption.title : "";
    }, [navbarOptions, location.pathname]);

    // --- 3. Return Object ---

    return {
        navbarData: { navbarOptions, activeTab },
    };
};
