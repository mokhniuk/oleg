import React from "react";

import Container from "@/app/components/Container/Container";
import Logo from "@/app/components/Logo/Logo";
import SiteMenu from "@/app/components/SiteMenu/SiteMenu";

import styles from "./header.module.scss";

interface HeaderProps {
  title?: string;
}

const MENU_ITEMS = [
  {
    url: "#works",
    label: "Works",
    title: "",
  },
  {
    url: "/about",
    label: "About",
    title: "",
  },
];

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={styles.header}>
      <Container width="fullscreen" mode="flex" className={styles.container}>
        <Logo />
        <SiteMenu menuItems={MENU_ITEMS} />
      </Container>
    </header>
  );
};

export default Header;
