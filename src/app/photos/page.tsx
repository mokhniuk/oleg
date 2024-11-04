import styles from "@/app/page.module.css";
import Container from "@/components/Container/Container";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.photography}>
        <Container width="fullscreen">
          <h1>Photography</h1>

          <Image src="/images/berlin.jpg" alt="U1" width={1376} height={600} />
        </Container>
      </section>
    </main>
  );
}
