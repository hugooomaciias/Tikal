/** React & Third-Party Libraries */
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

/** Components */
import { HeroComponent } from "../../components/landing/HeroComponent.jsx"
import { PlansComponent } from "../../components/landing/PlansComponent.jsx"
import { ContactComponent } from "../../components/landing/contact/ContactComponent.jsx"
import { FooterComponent } from "../../components/landing/FooterComponent.jsx"

/** Assets & Icons */
import { IconMenu2Filled, IconX } from '@tabler/icons-react';

/**
 * Main Landing Page Component
 *
 * This component acts as the central orchestrator for the single-page
 * application layout. It implements a "Scroll Spy" pattern to detect the
 * currently active section within the viewport and dynamically adapts the
 * Header's appearance (logo, background color, and text color) to ensure optimal
 * contrast against the content. It also handles deep linking (hash navigation)
 * and responsive mobile menu states.
 *
 * @component
 * @returns {JSX.Element} The rendered Landing Page with sticky navigation and
 * content sections.
 */
export const LandingPage = () => {
	/**
	 * Access the current URL hash to handle deep linking.
	 */
	const { hash } = useLocation();

	/**
	 * State to track the ID of the section currently visible in the viewport.
	 * Drives the conditional styling of the navbar and logo.
	 * 
	 * @type {[string, function]}
	 */
	const [activeSection, setActiveSection] = useState("home");

	/**
	 * State to toggle the mobile navigation menu visibility.
	 * True indicates the dropdown is open, False indicates it's closed.
	 * 
	 * @type {[boolean, function]}
	 */
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	/**
	 * State to track if the page has been scrolled from the top.
	 * Used to conditionally apply a shadow to the navbar for better separation.
	 * 
	 * @type {[boolean, function]}
	 */
	const [isScrolled, setIsScrolled] = useState(false);

	/**
	 * Effect to handle Hash Navigation Handler
	 * 
	 * Detects if the user navigated here via a specific anchor. It performs a
	 * smooth scroll to the target element after the component mounts.
	 *
	 * @function
	 */
	useEffect(() => {
		if (hash) {
			const id = hash.replace('#', '');
			const element = document.getElementById(id);
			
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}, [hash]);

	/**
	 * Effect to manage the window scroll event subscription
	 *
	 * It calculates which section is currently crossing the top threshold of the
	 * screen to update the 'activeSection' state.
	 *
	 * @function
	 */
	useEffect(() => {
		// Scroll event handler
		const handleScroll = () => {
			const sections = ["home", "plans", "contact"];
			let currentSection = "home";

			// Dynamic Threshold Calculation
			const threshold = isMobileMenuOpen ? 250 : 104;

			// Determine the active section based on scroll position
			for (const section of sections) {
				const element = document.getElementById(section);

				if (element && element.getBoundingClientRect().top <= threshold) {
					currentSection = section;
				}
			}

			let isAtSectionStart = false;

			if (currentSection !== "home") {
				const currentElement = document.getElementById(currentSection);
	
				if (currentElement) {
					const rect = currentElement.getBoundingClientRect();
					
					isAtSectionStart = (rect.top < 104) && (rect.top > -10);
				}
			}

			// Update the different states
			setActiveSection(currentSection);
			setIsScrolled(window.scrollY > 0 && ! isAtSectionStart);

			const newHash = currentSection === 'home' ? ' ' : `#${currentSection}`;

			if (window.location.hash !== newHash.trim()) {
				window.history.replaceState(null, null, newHash === ' ' ? window.location.pathname : newHash);
			}
		};

		// Register event listener on component mount
		window.addEventListener("scroll", handleScroll);

		// Initial check to set correct state on load
		handleScroll();

		//  Cleanup event listener on component unmount to prevent memory leaks
		return () => window.removeEventListener("scroll", handleScroll);
	}, [isMobileMenuOpen]);

	/**
	 * Configuration object for section-specific visual styles.
	 * Maps each section ID to its corresponding assets and color palette.
	 *
	 * @constant {Object}
	 */
	const section_config = {
		home: {
			bg: "bg-primary-50",
			logo: "/public/logoHeader_1.svg",
			navbarBg: "bg-primary-300",
			mobileText: "text-primary",
		},
		plans: {
			bg: "bg-primary-300",
			logo: "/public/logoHeader_2.svg",
			navbarBg: "bg-primary-50",
			mobileText: "text-primary-300",
		},
		contact: {
			bg: "bg-primary-50",
			logo: "/public/logoHeader_1.svg",
			navbarBg: "bg-primary-300",
			mobileText: "text-primary",
		},
	};

	// Destructure configuration based on the current active section
	const { bg: bgColour, logo: logoColour, navbarBg: navbarBgColour, mobileText: mobileTextColour } = section_config[activeSection];

	/**
	 * Helper function to define navigation link classes dynamically.
	 * Ensures visual consistency between active and inactive states.
	 * 
	 * @function
	 * @param {string} sectionName - The ID of the target section.
	 * @returns {string} Tailwind CSS class string.
	 */
	const getLinkClasses = (sectionName) => {
		const isActive = activeSection === sectionName;
		
		let classes = "transition-colors duration-300 font-semibold cursor-pointer ";
		
		if (activeSection === "plans") {
			return classes + (isActive ? "text-primary-300" : "text-primary-600");
		}

		return classes + (isActive ? "text-primary-50" : "text-primary-600");
	};

	return (
		<div className="w-full relative">
			{/* Fixed header */}
			<header className={`fixed z-50 top-0 right-0 left-0
								${bgColour} bg-opacity-80 backdrop-blur-md transition-all duration-500 ease-in-out 
								${isScrolled && !isMobileMenuOpen ? "shadow-md" : ""}
								`}
			>
				<div className="w-full mx-auto flex items-center justify-between p-8">
					{/* Brand Logo */}
					<a href="#home" className={getLinkClasses("home")}>
						<img className="h-10 w-auto" src={`${logoColour}`} alt="Logo Tikal" />
					</a>

					{/* Desktop navigation */}
					<nav className={`hidden h-10 md:flex items-center gap-6
									${navbarBgColour} font-semibold px-4 rounded-full transition-colors duration-500 shadow-md
									`}
					>
						<a href="#home" className={getLinkClasses("home")}>
							Inicio
						</a>
						<a href="#plans" className={getLinkClasses("plans")}>
							Planes
						</a>
						<a href="#contact" className={getLinkClasses("contact")}>
							Contacto
						</a>
					</nav>

					{/* Mobile navigation */}
					<div className="md:hidden z-50">
						<button className={`p-2 rounded-full focus:outline-none transition-colors
											${isMobileMenuOpen ? "absolute left-1/2 -translate-x-1/2 top-8" : "relative shadow-md " + navbarBgColour}
										`}
								aria-label="Toggle mobile menu"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? (
								<IconX className={`h-6 w-6 ${mobileTextColour}`} />
							) : (
								<IconMenu2Filled className={`h-6 w-6 ${mobileTextColour}`} />
							)}
						</button>
					</div>
				</div>

				{/* Mobile dropdown menu */}
				<div className={`absolute md:hidden z-40 top-0 left-0 w-full flex flex-col items-center justify-center gap-6
								${navbarBgColour} pt-24 pb-8 shadow-2xl transition-all duration-300 ease-in-out 
								${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}
							`}
				>
					<a href="#home" className={getLinkClasses("home")} onClick={() => setIsMobileMenuOpen(false)}>
						Inicio
					</a>
					<a href="#plans" className={getLinkClasses("plans")} onClick={() => setIsMobileMenuOpen(false)}>
						Planes
					</a>
					<a href="#contact" className={getLinkClasses("contact")} onClick={() => setIsMobileMenuOpen(false)}>
						Contacto
					</a>
				</div>
			</header>
			
			{/* Sections Rendering */}
			<section id="home" className=" min-h-screen flex items-center justify-center bg-primary-50">
				<HeroComponent />
			</section>

			<section id="plans" className="min-h-screen flex items-center justify-center bg-primary-300">
				<PlansComponent />
			</section>

			<section id="contact" className="min-h-screen flex items-center justify-center bg-primary-50">
				<ContactComponent />
			</section>

			<FooterComponent />
		</div>
	);
};