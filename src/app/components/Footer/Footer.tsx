import styles from "./footer.module.scss";
import Container from "@/app/components/Container/Container";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Container width="fullscreen" mode="flex" className={styles.container}>
        Berlin, 2024
      </Container>
    </footer>
  );
};

export default Footer;
