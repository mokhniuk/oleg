import Image from "next/image";
import styles from "@/app/page.module.css";
import Container from "@/app/components/Container/Container";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Container width="fullscreen">
          <div className={styles["hero-content"]}>
            <p>
              Hey there, I’m Oleg. <br />
              Frontend Engineer and Designer from Kyiv
              <Image
                src="/kyiv_logo.png"
                alt=""
                width={34}
                height={36}
                className={styles["kyiv-logo"]}
              />
              , based in Berlin{" "}
              <Image
                src="/berlin_logo.png"
                alt=""
                width={42}
                height={46}
                className={styles["berlin-logo"]}
              />
              .
            </p>
          </div>
        </Container>
      </section>

      <section id="works" className={styles.workExamples}>
        <Container>
          <header className={styles["section-header"]}>
            <h2>Recent projects</h2>
            <p>
              My job is to create websites, apps, design systems and complex
              web-interfaces. Here are some of the recent ones I was working on:
            </p>
            <Link href="#" title="" className={styles["section-header__link"]}>
              archive of all works
            </Link>
          </header>

          <div className={styles.projects}>
            {/* Project 1 */}
            <div className={styles.project}>
              <Image
                src="/project1.jpg"
                alt="Project 1"
                width={400}
                height={300}
              />
              <h3>Project 1</h3>
              <p>Short case study for Project 1</p>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.contact}>
        <Container>
          <header className={styles["section-header"]}>
            <h2>Contact</h2>
            <p>
              I am currently available for hire. Feel free to contact me via{" "}
              <Link href="#" title="">
                email
              </Link>
              , add me on{" "}
              <Link href="#" title="">
                LinkedIn
              </Link>{" "}
              or follow on{" "}
              <Link href="#" title="">
                Instagram
              </Link>
              .
            </p>
            <Link href="#" title=""></Link>
          </header>

          <Link href="/photos" title="" className={styles["photography-link"]}>
            <Image
              src="/berlin.jpg"
              alt=""
              width={1280}
              height={845}
              className={styles["photography-link__image"]}
            />
          </Link>
        </Container>
      </section>
    </main>
  );
}
