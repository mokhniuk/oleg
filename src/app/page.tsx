import styles from "@/app/page.module.css";
import Container from "@/components/Container/Container";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import ProjectCard from "@/components/ProjectCard/ProjectCard";
import { WORKS } from "@/data/works";
import { PET_PROJECTS } from "@/data/pet-projects";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Container width="fullscreen" className={styles["hero-container"]}>
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
                project.show &&
                project.featured && (
                  <ProjectCard
                    key={project.title}
                    slug={project.slug}
                    title={project.title}
                    bgColor={project.bgColor}
                    description={project.description}
                    link={project.link}
                  />
                )
              );
            })}
          </div>
        </Container>
      </section>

      <section hidden >
        <Container>
          <SectionHeader
            title="Pet projects"
            sectionDescription="Some tools I've created to make my life easier. Or just because I've had an idea."
          />

          <ul className={styles.petProjects}>
            {PET_PROJECTS.map((project) => {
              return (
                <li key={project.id}>
                  <a href={project.url} target="_blank" className={styles["pet-project__link"]}>
                    <figure className={styles.icon}>
                      <img src={project.icon} alt={project.title} />
                    </figure>
                    <p className={styles.title}>{project.title}</p>
                    <figure className={styles.preview}>
                      <img src={project.image} alt={project.title} />
                    </figure>
                    <p className={styles.description}>{project.description}</p>
                  </a>
                </li>
              );
            })}
          </ul>
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
