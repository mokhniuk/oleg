import styles from "./footer.module.scss";
import Container from "@/components/Container/Container";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Container width="fullscreen" mode="flex" className={styles.container}>
        {/* <ul className={styles["links-list"]}>
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
        </ul> */}

        <ul className={styles["links-list"]}>
          <li className={styles["links-list__item"]}>
            <a href="https://github.com/mokhniuk" target="_blank" rel="noopener noreferrer" title="">
              Github
            </a>
          </li>
          <li className={styles["links-list__item"]}>
            <a
              href="https://www.behance.net/mokhniuk"
              target="_blank"
              rel="noopener noreferrer"
              title=""
            >
              Behance
            </a>
          </li>
          <li className={styles["links-list__item"]}>
            <a
              href="https://www.instagram.com/mokhniuk/"
              target="_blank"
              rel="noopener noreferrer"
              title=""
            >
              Instagram
            </a>
          </li>
        </ul>

        {/* <Link href="/ua" title="">
          Українською
        </Link> */}

        <p className={styles.copyright}>Berlin, 2025</p>
      </Container>
    </footer>
  );
};

export default Footer;
