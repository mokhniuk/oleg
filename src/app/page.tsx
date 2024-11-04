import styles from "@/app/page.module.css";
import Container from "@/components/Container/Container";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import ProjectCard from "@/components/ProjectCard/ProjectCard";
import {WORKS} from "@/data/works";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Container width="fullscreen">
          <div className={styles["hero-content"]}>
            <p>
              Hey there, I’m Oleg. <br />I am designer and engineer from{" "}
              <span className={styles.nobr}>
                Kyiv&nbsp;
                <Image
                  src="./images/kyiv-logo.png"
                  alt=""
                  width={34}
                  height={36}
                  className={styles["kyiv-logo"]}
                />
                ,
              </span>{" "}
              based{" "}
              <span className={styles.nobr}>
                in Berlin{" "}
                <Image
                  src="./images/berlin-logo.png"
                  alt=""
                  width={42}
                  height={46}
                  className={styles["berlin-logo"]}
                />
                .
              </span>
            </p>
          </div>
        </Container>
      </section>

      <section id="works" className={styles.works}>
        <Container>
          <SectionHeader
            title="Recent projects"
            // linkLabel="archive of all works"
            linkUrl="#"
            sectionDescription="My job mostly consists of designing and coding websites, web applications, design systems and complex
              web-interfaces. I also enjoy working on visual journalism projects. "
          />

          <div className={styles.projects}>
            {WORKS.map((project) => {
              return (
                project.show && project.featured && <ProjectCard
                  key={project.title}
                  title={project.title}
                  imageUrl={project.imageUrl}
                  bgColor={project.bgColor}
                  description={project.description}
                  platformsDescription={project.platformsDescription}
                  url={project.url}
                  urlLabel={project.urlLabel}
                  url2={project.url2}
                  urlLabel2={project.urlLabel2}
                  stack={project.stack}
                />
              );
            })}
          </div>
        </Container>
      </section>

      <section className={styles.contact} id="contact">
        <Container>
          <SectionHeader
            title="Contact"
            sectionDescription={
              <>
                I am currently available for hire. Feel free to contact me via{" "}
                <a href="mailto:oleg.mokhniuk+hello@gmail.com">email</a>, add me
                on{" "}
                <a href="https://www.linkedin.com/in/mokhniuk/" target="_blank">
                  LinkedIn
                </a>{" "}
                or follow on{" "}
                <a href="https://www.instagram.com/mokhniuk/">Instagram</a>.
              </>
            }
          />

          {/* <Link
            href="/photos"
            title="Photography"
            className={styles["photography-link"]}
            hidden
          > */}
          <Image
            src="./images/berlin.jpg"
            alt=""
            width={1280}
            height={600}
            className={styles["photography-link__image"]}
            loading="lazy"
          />
          {/* </Link> */}
        </Container>
      </section>
    </main>
  );
}
