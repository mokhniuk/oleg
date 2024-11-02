// import Image from "next/image";
import styles from "@/app/page.module.css";
import Container from "@/components/Container/Container";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import ProjectCard from "@/components/ProjectCard/ProjectCard";

const FEATURED_WORDKS = [
  {
    imageUrl: "./projects/2402.jpg",
    bgColor: "#ffe0dc",
    title: "2402 Foundation",
    description:
      "Support of the wordpress website for the foundation that helps journalists in Ukraine.",
    // platformsDescription: "string",
    stack: "Wordpress, HTML, CSS, JS",
    url: "https://2402.org",
    urlLabel: "2402.org",
  },
  {
    imageUrl: "./projects/kashtan.jpg",
    bgColor: "#E9F4E8",
    title: "Kashtan Berlin",
    description:
      "Website design and development for a marketplace of Ukrainian products in Berlin.",
    // platformsDescription: "string",
    stack: "Figma",
    url: "https://kashtaninberlin.de",
    urlLabel: "Comming soon",
  },
  {
    // imageUrl: "./projects/vitsche/100.jpg",
    bgColor: "#fffff2",
    title: "The Bus That Never Arrives",
    description:
      "Designing and implementing website for the soundscape project about Berlin's bus route #100",
    // platformsDescription: "string",
    stack: "HTML, CSS, JS, Figma",
    url: "https://busthatneverarrives.com",
    urlLabel: "busthatneverarrives.com",
  },
  {
    imageUrl: "./projects/ecology.webp",
    bgColor: "#fff3f8",
    title: "Nature on the Edge",
    description:
      "Implemented responsive layout for the project page and integrated it in existing website.",
    // platformsDescription: "string",
    stack: "WordPress, HTML, CSS, JS, Figma",
    url: "https://vitsche.org/ecology",
    urlLabel: "vitsche.org/ecology",
  },
  {
    imageUrl: "./projects/u-bar.jpg",
    bgColor: "#fff2b0",
    title: "U Bar Berlin",
    description: "Designed website for amazing speakeasy bar in Berlin.",
    // platformsDescription: "string",
    stack: "Figma",
    url: "https://ubar.me",
    urlLabel: "Comming soon",
  },
  // {
  //   imageUrl: "./projects/pandora-cards.jpg",
  //   bgColor: "",
  //   title: "Pandora Cards",
  //   description: "Frontend development of web application.",
  //   // platformsDescription: "string",
  //   stack: "Next.js, TypeScript, CSS-modules, Figma",
  //   // url: "Url",
  //   // urlLabel: "string",
  // },
  {
    imageUrl: "./projects/up.jpg",
    bgColor: "#EBEDF0",
    title: "Unlimited Paper",
    description:
      "Created a component library and designed landing pages for electronic price tags producer.",
    platformsDescription: "Designed mobile app for iOS and Android.",
    stack: "Figma, Webflow",
    url: "https://u-paper.com",
    urlLabel: "u-paper.com",
  },
  // {
  //   imageUrl: "./projects/wundertax.jpg",
  //   bgColor: "#F6FAFA",
  //   title: "wundertax",
  //   description:
  //     "As part of the team I took ownership of unifying design elements and design facelifting. Result of my work was a wundertax Design System, created as a Figma library.",
  //   platformsDescription:
  //     " Usage of the design system was kickstarted with building new pricing page for the website and onboarding flow, using new components.",
  //   stack: "Figma, React.js, TypeScript, Storybook, Wordpress, Hugo",
  //   url: "https://wundertax.de/onboarding/en/",
  //   urlLabel: "wundertax.de/onboarding",
  //   url2: "https://wundertax.de/en/price/",
  //   urlLabel2: "wundertax.de/price",
  // },
];

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
                <img
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
                <img
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
          <img
            src="./images/berlin.jpg"
            alt=""
            width={1280}
            height={845}
            className={styles["photography-link__image"]}
            loading="lazy"
          />
          {/* </Link> */}
        </Container>
      </section>
    </main>
  );
}
