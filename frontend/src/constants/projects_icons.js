/** Assets & Icons */
import { IconBook, IconNote, IconSchool, IconCertificate,
         IconDatabase, IconAppWindow, IconCode, IconCpu, IconDeviceMobile, IconCloud,
         IconBriefcase, IconCalculator, IconChartBar, IconPresentation, IconTarget,
         IconPalette, IconWand, IconCamera, IconBrush, IconMusic,
         IconFolder, IconListFilled, IconCalendarWeekFilled, IconPaperclip, IconFlag,
         IconRocket, IconCoffee, IconHeart, IconStar, IconHome
       } from '@tabler/icons-react'

/**
 * Predefined Projects and Lists Icons
 *
 * This constant array provides a curated list of Icons available for selection
 * when creating or editing a Project or List. It groups icons by category and 
 * maps a simple string ID to the corresponding React component from Tabler Icons.
 *
 * @type {Array<{id: string, component: React.FC}>}
 */
export const PROJECTS_ICONS = [
    // Education & Study
    { id: "book", component: IconBook },
    { id: "note", component: IconNote },
    { id: "school", component: IconSchool },
    { id: "certificate", component: IconCertificate },
    
    // Technology & Development
    { id: "database", component: IconDatabase },
    { id: "web", component: IconAppWindow },
    { id: "code", component: IconCode },
    { id: "cpu", component: IconCpu },
    { id: "device-mobile", component: IconDeviceMobile },
    { id: "cloud", component: IconCloud },
    
    // Work & Business
    { id: "briefcase", component: IconBriefcase },
    { id: "calculator", component: IconCalculator },
    { id: "chart-bar", component: IconChartBar },
    { id: "presentation", component: IconPresentation },
    { id: "target", component: IconTarget },
    
    // Design & Creativity
    { id: "palette", component: IconPalette },
    { id: "wand", component: IconWand },
    { id: "camera", component: IconCamera },
    { id: "brush", component: IconBrush },
    { id: "music", component: IconMusic },

    // Organisation & Tasks
    { id: "folder", component: IconFolder },
    { id: "checklist", component: IconListFilled },
    { id: "calendar", component: IconCalendarWeekFilled },
    { id: "paperclip", component: IconPaperclip },
    { id: "flag", component: IconFlag },

    // General & Lifestyle
    { id: "rocket", component: IconRocket },
    { id: "coffee", component: IconCoffee },
    { id: "heart", component: IconHeart },
    { id: "star", component: IconStar },
    { id: "home", component: IconHome }
];