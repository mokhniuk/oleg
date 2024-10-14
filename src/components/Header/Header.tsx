import Container from "@/components/Container/Container";
import Logo from "@/components/Logo/Logo";
import SiteMenu from "@/components/SiteMenu/SiteMenu";

import styles from "./header.module.scss";

interface HeaderProps {
  title?: string;
}

const MENU_ITEMS = [
  {
    url: "#works",
    label: "Works",
    title: "",
    visible: true,
  },
  {
    url: "/about",
    label: "About",
    title: "",
    visible: false,
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
