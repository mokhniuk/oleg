"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import SiteMenu from "@/components/SiteMenu/SiteMenu";

import styles from "./header.module.scss";

interface HeaderProps {
  title?: string;
}

const MENU_ITEMS = [
  {
    url: "/#works",
    label: "Works",
    title: "Works",
    visible: true,
  },
  {
    url: "/photography",
    label: "Photography",
    title: "Photography",
    visible: false,
  },
  {
    url: "/dj",
    label: "DJ",
    title: "DJ",
    visible: true,
  },
  {
    url: "/about",
    label: "About",
    title: "About",
    visible: true,
  },
  {
    url: "/#contact",
    label: "Contact",
    title: "Contact",
    visible: true,
  },
];

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const lastScrollYRef = useRef(0);
  const isVisibleRef = useRef(true);

  // Function to update visibility state and ref
  const updateVisibility = (visible: boolean) => {
    if (isVisibleRef.current !== visible) {
      isVisibleRef.current = visible;
      setIsVisible(visible);
    }
  };

  // Reset visibility on navigation
  useEffect(() => {
    updateVisibility(true);
    lastScrollYRef.current = window.scrollY;

    // Small timeout to handle cases where the jump happens shortly after navigation
    const timer = setTimeout(() => {
      updateVisibility(true);
      lastScrollYRef.current = window.scrollY;
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const lastScrollY = lastScrollYRef.current;

          // Always show header when at the top
          if (currentScrollY < 50) {
            updateVisibility(true);
          } else {
            // Show header when scrolling up, hide when scrolling down
            if (currentScrollY < lastScrollY) {
              // Scrolling up
              updateVisibility(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down and not near the top
              updateVisibility(false);
            }
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is near the top of the screen (within 80px)
      if (e.clientY < 80) {
        updateVisibility(true);
      }
    };

    // Also handle hash changes (e.g. clicking #works from same page)
    const handleHashChange = () => {
      updateVisibility(true);
      lastScrollYRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("hashchange", handleHashChange);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []); // Re-run effect only on mount

  return (
    <header
      className={`${styles.header} ${isVisible ? styles.visible : styles.hidden
        }`}
    >
      <Container mode="flex" className={styles.container}>
        <Logo />
        <SiteMenu menuItems={MENU_ITEMS} />
      </Container>
    </header>
  );
};

export default Header;
