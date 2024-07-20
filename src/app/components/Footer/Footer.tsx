import styles from "./footer.module.scss";
import Container from "@/app/components/Container/Container";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Container width="fullscreen" mode="flex" className={styles.container}>
        <ul className={styles["links-list"]}>
          <li className={styles["links-list__item"]}>
            <Link href="#work" title="">
              Works
            </Link>
          </li>
          <li className={styles["links-list__item"]}>
            <Link href="#" title="">
              Photography
            </Link>
          </li>
          <li className={styles["links-list__item"]}>
            <Link href="#" title="">
              DJing
            </Link>
          </li>
        </ul>

        <ul className={styles["links-list"]}>
          <li className={styles["links-list__item"]}>
            <Link href="https://github.com/mokhniuk" target="_blank" title="">
              Github
            </Link>
          </li>
          <li className={styles["links-list__item"]}>
            <Link
              href="https://www.behance.net/mokhniuk"
              target="_blank"
              title=""
            >
              Behance
            </Link>
          </li>
          <li className={styles["links-list__item"]}>
            <Link
              href="https://www.instagram.com/mokhniuk/"
              target="_blank"
              title=""
            >
              Instagram
            </Link>
          </li>
        </ul>

        <Link href="/ua" title="">
          Українською
        </Link>

        <p className={styles.copyright}>Berlin, 2024</p>
      </Container>
    </footer>
  );
};

export default Footer;
