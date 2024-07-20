import React from "react";
import styles from "./site-menu.module.scss";

interface MenuItem {
  label: string;
  url: string;
  visible: boolean;
}

interface SiteMenuProps {
  menuItems: MenuItem[];
}

const SiteMenu: React.FC<SiteMenuProps> = ({ menuItems }) => {
  return (
    <nav className={styles.menu}>
      <ul className={styles["menu__list"]}>
        {menuItems.map(
          (menuItem: MenuItem) =>
            menuItem.visible && (
              <li key={menuItem.label} className={styles["menu__item"]}>
                <a href={menuItem.url} className={styles["menu__link"]}>
                  {menuItem.label}
                </a>
              </li>
            )
        )}
      </ul>
    </nav>
  );
};

export default SiteMenu;
