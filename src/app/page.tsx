// import Image from "next/image";
import styles from "@/app/page.module.css";
import Container from "@/app/components/Container/Container";
import SectionHeader from "@/app/components/SectionHeader/SectionHeader";
import ProjectCard from "@/app/components/ProjectCard/ProjectCard";

const FEATURED_WORDKS = [
  {
    imageUrl: "/projects/pandora-cards.jpg",
    bgColor: "",
    title: "Pandora Cards",
    description: "frontend development.",
    // platformsDescription: "string",
    stack: "Next.js, TypeScript, CSS-modules, Figma",
    // url: "Url",
    // urlLabel: "string",
  },
  {
    imageUrl: "/projects/up.jpg",
    bgColor: "#EBEDF0",
    title: "Unlimited Paper",
    description:
      "Created a component library and designed landing pages for electronic price tags producer.",
    platformsDescription: "Designed mobile app for iOS and Android.",
    stack: "Figma, Webflow",
    url: "https://u-paper.com",
    urlLabel: "u-paper.com",
  },
  {
    imageUrl: "/projects/wundertax.jpg",
    bgColor: "#F6FAFA",
    title: "wundertax",
    description:
      "As part of the team I took ownership of unifying design elements and design facelifting. Result of my work was a wundertax Design System, created as a Figma library.",
    platformsDescription:
      " Usage of the design system was kickstarted with building new pricing page for the website and onboarding flow, using new components.",
    stack: "Figma, React.js, TypeScript, Storybook, Wordpress, Hugo",
    url: "https://wundertax.de/onboarding/en/",
    urlLabel: "wundertax.de/onboarding",
    url2: "https://wundertax.de/en/price/",
    urlLabel2: "wundertax.de/price",
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Container width="fullscreen">
          <div className={styles["hero-content"]}>
            <p>
              Hey there, I’m Oleg. <br />
              I am designer and engineer from&nbsp;Kyiv
              <img
                src="./images/kyiv-logo.png"
                alt=""
                width={34}
                height={36}
                className={styles["kyiv-logo"]}
              />
              , based in&nbsp;Berlin{" "}
              <img
                src="./images/berlin-logo.png"
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

      <section id="works" className={styles.works}>
        <Container>
          <SectionHeader
            title="Recent projects"
            linkLabel="archive of all works"
            linkUrl="#"
            sectionDescription="My job is to create websites, apps, design systems and complex
              web-interfaces. Here are some of the recent ones I was working on:"
          />

          <div className={styles.projects}>
            {FEATURED_WORDKS.map((project) => {
              return (
                <ProjectCard
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

      <section className={styles.contact}>
        <Container>
          <SectionHeader
            title="Contact"
            sectionDescription={`I am currently available for hire. Feel free to contact me via email, add me on LinkedIn or follow on Instagram.`}
          />

          {/* <Link
            href="/photos"
            title="Photography"
            className={styles["photography-link"]}
            hidden
          >
            <Image
              src="/images/berlin.jpg"
              alt=""
              width={1280}
              height={845}
              className={styles["photography-link__image"]}
            />
          </Link> */}
        </Container>
      </section>
    </main>
  );
}
