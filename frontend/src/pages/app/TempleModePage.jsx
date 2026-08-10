/** Contexts, Hooks & Services */
import { useTempleModeLogic } from "../../hooks/components/app/temple-mode/useTempleModeLogic.js";

/** Components & Layouts */
import { TempleModePopUpComponent } from "../../components/app/temple-mode/TempleModePopUpComponent.jsx";
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { ScrollingText } from "../../components/app/common/ScrollingText.jsx";

/** Icons */
import { IconChevronDown, IconHourglassFilled } from "@tabler/icons-react";

/**
 * Temple Mode Page Component
 *
 * This purely presentational component acts as the primary layout wrapper for the user's
 * Temple Mode (deep focus/zen) dashboard. It delegates all its complex state management, 
 * progression calculations, and data fetching logic to the `useTempleModeLogic` hook, 
 * focusing strictly on rendering the immersive UI, responsive grids, and interactive progression badges.
 *
 * @component
 * @returns {JSX.Element|null} The rendered Temple Mode dashboard, or null if data is not loaded.
 */
export const TempleModePage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Temple Mode Logic
     *
     * Extracts state variables, derived datasets, and action handlers from the headless hook.
     * This strictly isolates the complex business logic and interval engines from the purely 
     * visual rendering hierarchy.
     */
    const { translations, templeModeStates, templeModeData, templeModeActions } = useTempleModeLogic();

    const { tTemple, tCommon } = translations;
    const { menuRef, isDataLoaded, isTotemsMenuOpen, isRunning, isPopUpOpen } = templeModeStates;
    const { data, additionalData, formattedTime, timerProgressPercentage, cascadingOptions } = templeModeData;
    const { toggleTotemsMenu, handleOpenTimerConfig, handleClosePopUp, handleStopSession } = templeModeActions;

    if (!isDataLoaded || !templeModeData) {
        return null;
    }

    const { theme, progressPercentage, totems, unlockedTotems, lockedTotems, nextTargetTotem } = additionalData;
    
    /**
     * SVG Progress Ring Mathematics
     *
     * Computes the geometric properties of the circular progress indicator.
     * Calculates the absolute circumference and the dynamic stroke-dashoffset required
     * to animate the active session timer smoothly based on the current percentage.
     */
    const circleRadius = 46;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const circleOffset = circleCircumference - (circleCircumference * timerProgressPercentage) / 100;

    // --- 2. Render ---

    return (
        <div 
            className="flex flex-col md:flex-row h-[100dvh] bg-cover bg-center bg-no-repeat p-2 md:p-4 gap-4 md:gap-8 overflow-hidden"
            style={{ backgroundImage: `url(${data.templeImageUrl})` }}
        >
            {/* Vertical Navbar Navigation Layer */}
            {!isRunning && (
                <NavbarComponent />
            )}

            {/* Core Scrollable Content Area */}
            <section className="flex-1 flex flex-col gap-4 md:gap-6 w-full h-full overflow-hidden">
                <div className="flex flex-col gap-3 md:gap-4 w-full min-w-0">
                    <HeaderComponent
                        page={tTemple("temple-mode_title")}
                        templeName={data.templeName}
                        theme={theme}
                        t={tTemple}
                    />

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4 w-full min-w-0">
                        {/* LEFT COLUMN: Rank Badge & Timer Config */}
                        <div className="flex flex-col gap-4 w-full lg:w-fit min-w-[33%]">
                            
                            {/* --- Current Rank Badge --- */}
                            <div className={`flex items-center gap-5 ${theme.wrapper} border shadow-lg rounded-[2rem] p-4 transition-all duration-300 backdrop-blur-sm`}>
                                <div className={`w-20 h-20 shrink-0 flex items-center justify-center px-1 rounded-2xl bg-quaternary-800/20 border-2 ${theme.borderLogo}`}>
                                    <div
                                        className={`${theme.logo} ${data.rank === 2 ? "w-[65px] h-[65px]" : data.rank === 3 ? "w-[60px] h-[60px]" : "w-full h-full"}`}
                                        style={{
                                            maskImage: `url(${data.badgeImageUrl})`,
                                            WebkitMaskImage: `url(${data.badgeImageUrl})`,
                                            maskRepeat: "no-repeat",
                                            WebkitMaskRepeat: "no-repeat",
                                            maskSize: "contain",
                                            WebkitMaskSize: "contain",
                                            maskPosition: "center",
                                            WebkitMaskPosition: "center",
                                        }}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between h-20 py-1.5 pr-2 min-w-0"> 
                                    <div className="flex items-start justify-between gap-4 w-full">
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className={`text-[10px] uppercase font-bold tracking-widest opacity-80 ${theme.subtitle} truncate`}>
                                                {tTemple("subheader.rank_badge.label")} {data.rank}
                                            </span>
                                            <h3 className={`font-passero font-bold text-xl leading-none mt-1 truncate ${theme.title}`}>
                                                {data.awardedTitle}
                                            </h3>
                                        </div>

                                        <div className="flex flex-col items-end shrink-0">
                                            <span className={`text-[10px] uppercase font-bold tracking-widest opacity-80 ${theme.subtitle}`}>
                                                {tTemple("subheader.rank_badge.totems")}
                                            </span>
                                            <h3 className={`font-passero font-bold text-xl leading-none mt-1 truncate ${theme.title}`}>
                                                {unlockedTotems.length} / {totems.length}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="w-full flex items-center gap-2 mt-1">
                                        <div className="relative flex-1 group/progress cursor-pointer min-w-0">
                                            <div className={`h-2 rounded-full overflow-hidden ${theme.track}`}>
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ease-out ${theme.progress}`}
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                            <div 
                                                className={`absolute -top-8 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 scale-95 group-hover/progress:opacity-100 group-hover/progress:scale-100 transition-all duration-200 pointer-events-none z-10 shadow-xl backdrop-blur-md border border-white/10 ${theme.progress} ${theme.title}`}
                                                style={{ left: `${progressPercentage}%` }}
                                            >
                                                {data.currentHours} / {data.requiredHours} h
                                                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${theme.progress} border-b border-r border-white/10`} />
                                            </div>
                                        </div>
                                        <span className={`shrink-0 text-xs font-mono font-bold ${theme.subtitle}`}>
                                            {progressPercentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* --- Active Timer & Chronometer Module --- */}
                            <div className={`w-full flex flex-1 flex-col items-center justify-center gap-6 ${theme.wrapper} border shadow-lg rounded-[2.5rem] p-8 transition-all duration-300 backdrop-blur-md relative overflow-hidden`}>           
                                {/* Circular Functional Progress Ring */}
                                <div className="relative w-48 h-48 rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] bg-quaternary-900/30">
                                    
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                        {/* Background Track Circle */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r={circleRadius}
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            fill="none"
                                            className="text-white/10"
                                        />
                                        {/* Dynamic Progress Circle */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r={circleRadius}
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            fill="none"
                                            className={`${theme.progressText} transition-all duration-1000 ease-linear`}
                                            strokeDasharray={circleCircumference}
                                            strokeDashoffset={circleOffset}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    
                                    {/* Inner Asset Container (e.g. Aztec Calendar) */}
                                    <div className="w-[85%] h-[85%] rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                        <div className={`w-20 h-20 shrink-0 flex flex-col items-center justify-center ${isRunning ? "animate-pulse" : ""}`}>
                                            <div
                                                className={`w-full h-full ${theme.logo}`}
                                                style={{
                                                    maskImage: `url(${nextTargetTotem.totemImageUrl})`,
                                                    WebkitMaskImage: `url(${nextTargetTotem.totemImageUrl})`,
                                                    maskRepeat: "no-repeat",
                                                    WebkitMaskRepeat: "no-repeat",
                                                    maskSize: "contain",
                                                    WebkitMaskSize: "contain",
                                                    maskPosition: "center",
                                                    WebkitMaskPosition: "center",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Main Time Display */}
                                <h1 className={`font-passero font-bold text-6xl tracking-widest leading-none drop-shadow-xl ${theme.title} tabular-nums`}>
                                    {formattedTime}
                                </h1>

                                {/* Mode Toggle Configuration Actions */}
                                <div className="flex gap-4 w-full justify-center z-10">
                                    <button 
                                        type="button"
                                        onClick={handleOpenTimerConfig}
                                        className="p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-center bg-white/5 border-white/10 hover:bg-white/20 hover:border-white/40 shadow-inner"
                                        title="Configurar Temporizador"
                                    >
                                        <div className={`flex items-center justify-center gap-2 ${theme.title}`}>
                                            <IconHourglassFilled stroke={2} className="w-6 h-6 opacity-90" />
                                            <span className="mt-0.5 font-semibold">Configurar Temporizador</span>
                                        </div>
                                    </button>
                                </div>

                                {/* Primary State Control Trigger */}
                                {isRunning &&
                                    <button 
                                        onClick={handleStopSession}
                                        className={`w-full mt-2 py-4 rounded-full border border-white/10 ${theme.title} font-bold text-xl tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 transform bg-tertiary-300 text-tertiary-700`}
                                    >
                                        {tTemple("stopSessionButton")}
                                    </button>
                                }
                            </div>
                        </div>
                        
                        {/* RIGHT COLUMN: Active Totem Target & Expandable Menu */}
                        <div className="relative w-full lg:w-fit min-w-[35%]" ref={menuRef}>
                            <div 
                                onClick={toggleTotemsMenu}
                                className={`flex items-center gap-5 ${theme.wrapper} border pl-6 p-4 transition-all duration-300 backdrop-blur-sm cursor-pointer h-[112px] relative z-10 hover:brightness-125
                                    ${isTotemsMenuOpen ? "rounded-t-[2rem] rounded-b-none border-b-0 shadow-none" : "rounded-[2rem] shadow-lg"}
                                `}
                            >
                                <div className="flex-1 flex items-center justify-between h-20 py-1.5 pr-2 gap-4 min-w-0">
                                    <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className={`text-[10px] uppercase font-bold tracking-widest opacity-80 ${theme.subtitle} truncate`}>
                                                    {lockedTotems.length > 0 ? tTemple("subheader.totem_badge.label.hasMoreTotems") : tTemple("subheader.totem_badge.label.noMoreTotems")}
                                                </span>
                                                <IconChevronDown 
                                                    stroke={2.5}
                                                    className={`shrink-0 w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${theme.subtitle} ${isTotemsMenuOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`} 
                                                />
                                            </div>
                                            <h3 className={`font-passero font-bold text-xl leading-none mt-1 truncate w-full ${theme.title}`}>
                                                {nextTargetTotem?.name || "Completado"}
                                            </h3>
                                        </div>

                                        {nextTargetTotem && (
                                            <div className="w-full flex items-center gap-2 mt-1 min-w-0">
                                                <div className="relative flex-1 group/progress cursor-pointer min-w-0">
                                                    <div className={`h-2 rounded-full overflow-hidden ${theme.track}`}>
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ease-out ${theme.progress}`}
                                                            style={{ width: `${nextTargetTotem.progressPercentage}%` }}
                                                        />
                                                    </div>
                                                    <div 
                                                        className={`absolute -top-8 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap opacity-0 scale-95 group-hover/progress:opacity-100 group-hover/progress:scale-100 transition-all duration-200 pointer-events-none z-10 shadow-xl backdrop-blur-md border border-white/10 ${theme.progress} ${theme.title}`}
                                                        style={{ left: `${nextTargetTotem.progressPercentage}%` }}
                                                    >
                                                        {nextTargetTotem.currentProgress.progress} / {nextTargetTotem.targetProgress} h
                                                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${theme.progress} border-b border-r border-white/10`} />
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 text-xs font-mono font-bold ${theme.subtitle}`}>
                                                    {nextTargetTotem.progressPercentage}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {nextTargetTotem && (
                                            <div className="w-20 h-20 shrink-0 flex flex-col items-center justify-center">
                                                <div
                                                    className={`w-full h-full ${theme.logo}`}
                                                    style={{
                                                        maskImage: `url(${nextTargetTotem.totemImageUrl})`,
                                                        WebkitMaskImage: `url(${nextTargetTotem.totemImageUrl})`,
                                                        maskRepeat: "no-repeat",
                                                        WebkitMaskRepeat: "no-repeat",
                                                        maskSize: "contain",
                                                        WebkitMaskSize: "contain",
                                                        maskPosition: "center",
                                                        WebkitMaskPosition: "center",
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`absolute top-full left-0 right-0 w-full z-50 transition-all duration-300 origin-top backdrop-blur-sm ${isTotemsMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}>
                                <div className={`${theme.wrapper} border border-t-0 shadow-2xl rounded-b-[2rem] rounded-t-none p-4 flex flex-col gap-2 backdrop-blur-xl h-max max-h-[50dvh] overflow-y-auto custom-scrollbar`}>
                                    {totems.map((totem) => (
                                        <div 
                                            key={totem.id} 
                                            className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 min-w-0
                                                ${totem.isUnlocked ? "" : nextTargetTotem.name === totem.name ? "grayscale" : "opacity-60 grayscale"}`}
                                        >
                                            <div className="w-14 h-14 shrink-0 flex flex-col items-center justify-center">
                                                <div
                                                    className={`w-full h-full ${theme.logo}`}
                                                    style={{
                                                        maskImage: `url(${totem.totemImageUrl})`,
                                                        WebkitMaskImage: `url(${totem.totemImageUrl})`,
                                                        maskRepeat: "no-repeat",
                                                        WebkitMaskRepeat: "no-repeat",
                                                        maskSize: "contain",
                                                        WebkitMaskSize: "contain",
                                                        maskPosition: "center",
                                                        WebkitMaskPosition: "center",
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                                                <div className="flex justify-between items-end w-full gap-3">
                                                    <h4 className={`flex-1 min-w-0 font-passero font-bold text-lg leading-none truncate ${theme.title}`}>
                                                        {totem.name}
                                                    </h4>
                                                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider ${theme.track} ${theme.subtitle}`}>
                                                        {totem.type}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-end w-full gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <ScrollingText 
                                                            className={`text-[11px] leading-tight whitespace-nowrap ${theme.subtitle}`} 
                                                            text={totem.goalDescription} 
                                                        />
                                                    </div>
                                                    <span className={`shrink-0 text-[11px] font-mono font-bold leading-none ${theme.subtitle}`}>
                                                        {totem.currentProgress.progress} / {totem.targetProgress}
                                                    </span>
                                                </div>

                                                <div className={`h-1.5 w-full rounded-full mt-1 overflow-hidden ${theme.track}`}>
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${totem.isUnlocked ? theme.progress : theme.progress}`} 
                                                        style={{ width: `${totem.progressPercentage}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {isPopUpOpen && (
                <TempleModePopUpComponent
                    onClose={handleClosePopUp}
                    theme={theme}
                    cascadingOptions={cascadingOptions}
                    tTemple={tTemple}
                    tCommon={tCommon}
                />
            )}
        </div>
    );
};