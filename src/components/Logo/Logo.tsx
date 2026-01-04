import Link from "next/link";
import styles from "./logo.module.scss";

interface LogoProps {
  // Add any props you need for your Logo component
}

const Logo: React.FC<LogoProps> = (
  {
    /* Destructure props here */
  }
) => {
  // Add your component logic and JSX here

  return (
    <Link href="/" title="" className={styles["logo-link"]} prefetch={false}>
      Oleg Mokhniuk
    </Link>
  );
};

export default Logo;
