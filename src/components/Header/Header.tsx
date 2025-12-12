"use client";

import { useState, useEffect } from "react";
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
    url: "/djing",
    label: "DJing",
    title: "DJing",
    visible: false,
  },
  {
    url: "/about",
    label: "About",
    title: "",
    visible: false,
  },
  {
    url: "/retainer",
    label: "Retainer",
    title: "",
    visible: false,
  },
  {
    url: "/#contact",
    label: "Contact",
    title: "Contact",
    visible: false,
  },
];

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Always show header when at the top
          if (currentScrollY < 50) {
            setIsVisible(true);
          } else {
            // Show header when scrolling up, hide when scrolling down
            if (currentScrollY < lastScrollY) {
              // Scrolling up
              setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down and not near the top
              setIsVisible(false);
            }
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is near the top of the screen (within 100px)
      if (e.clientY < 80) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`${styles.header} ${isVisible ? styles.visible : styles.hidden
        }`}
    >
      <Container width="fullscreen" mode="flex" className={styles.container}>
        <Logo />
        <SiteMenu menuItems={MENU_ITEMS} />
      </Container>
    </header>
  );
};

export default Header;
