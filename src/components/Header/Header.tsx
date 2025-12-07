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
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY < 50;

      setIsAtTop(atTop);

      // If not at top, hide the header after scrolling
      if (!atTop) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsVisible(false);
        }, 150);
      } else {
        // Show header when at top
        setIsVisible(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is near the top of the screen (within 100px)
      if (e.clientY < 100 && !isAtTop) {
        setIsVisible(true);
      } else if (e.clientY > 150 && !isAtTop) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(scrollTimeout);
    };
  }, [isAtTop]);

  return (
    <header
      className={`${styles.header} ${
        isVisible ? styles.visible : styles.hidden
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
