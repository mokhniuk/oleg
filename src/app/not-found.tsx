import Link from "next/link";
import styles from "./not-found.module.scss";
import Container from "@/components/Container/Container";

export default function NotFound() {
    return (
        <Container width="narrow">
            <main className={styles.main}>
                <h1 className={styles.title}>404</h1>
                <p className={styles.description}>Page not found :(</p>
                <Link href="/" className={styles.link}>
                    Return Home
                </Link>
            </main>
        </Container>
    );
}
