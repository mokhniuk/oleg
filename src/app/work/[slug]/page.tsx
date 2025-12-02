import { WORKS } from "@/data/works";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container/Container";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import styles from "./page.module.scss";
import Image from "next/image";
interface CaseStudyPageProps {
  params: {
    slug: string;
  };
}

// Add the CaseStudy type with coverImage property
interface CaseStudy {
  task?: string;
  releaseDate?: string;
  role?: string;
  link?: string;
  overview?: string;
  roleDetails?: string;
  timeline?: string;
  stack?: string;
  challenge?: string;
  solution?: string;
  images?: string[];
  outcome?: string;
  testimonial?: {
    quote: string;
    author: string;
    position?: string;
  };
  coverImage?: string;
}

// Generate static params for all works
export async function generateStaticParams() {
  return WORKS.map((work) => ({
    slug: work.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CaseStudyPageProps) {
  const work = WORKS.find((w) => w.slug === params.slug);

  if (!work) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `${work.title} - Oleg Mokhniuk`,
    description: work.description,
  };
}

export default function CaseStudyPage({ params }: CaseStudyPageProps) {
  const work = WORKS.find((w) => w.slug === params.slug);

  if (!work) {
    notFound();
  }

  const { caseStudy } = work;

  // Find displayed works (only those with show: true)
  const displayedWorks = WORKS.filter((w) => w.show);
  const currentIndex = displayedWorks.findIndex((w) => w.slug === params.slug);
  const prevWork = currentIndex > 0 ? displayedWorks[currentIndex - 1] : null;
  const nextWork =
    currentIndex < displayedWorks.length - 1
      ? displayedWorks[currentIndex + 1]
      : null;
  return (
    <main className={styles.main}>
      <CaseStudyHero
        title={work.title}
        description={work.description}
        bgColor={work.bgColor}
        task={caseStudy?.task}
        releaseDate={caseStudy?.releaseDate}
        role={caseStudy?.role}
        link={caseStudy?.link || work.link}
      />

      {/* case study cover fullsize image */}
      {caseStudy?.coverImage && (
        <figure className={styles.caseStudyCoverImage}>
          <Image
            src={caseStudy?.coverImage}
            alt={work.title + " cover image"}
            fill
            sizes="100vw"
            style={{ objectFit: "cover", backgroundColor: work.bgColor }}
            priority
          />
        </figure>
      )}

      {caseStudy?.overview && (
        <CaseStudySection title="Overview">
          <p>{caseStudy.overview}</p>
        </CaseStudySection>
      )}

      {caseStudy?.roleDetails && (
        <CaseStudySection title="My Role" bgColor="#fafafa">
          <p>{caseStudy.roleDetails}</p>
        </CaseStudySection>
      )}

      {caseStudy?.timeline && (
        <CaseStudySection title="Timeline">
          <p>{caseStudy.timeline}</p>
        </CaseStudySection>
      )}

      {caseStudy?.stack && (
        <CaseStudySection title="Technology Stack" bgColor="#fafafa">
          <p>{caseStudy.stack}</p>
        </CaseStudySection>
      )}

      {caseStudy?.challenge && (
        <CaseStudySection title="Challenge" bgColor="#fafafa">
          <p>{caseStudy.challenge}</p>
        </CaseStudySection>
      )}

      {caseStudy?.solution && (
        <CaseStudySection title="Solution">
          <p>{caseStudy.solution}</p>
        </CaseStudySection>
      )}

      {caseStudy?.images && caseStudy.images.length > 0 && (
        <CaseStudySection>
          <ImageGallery images={caseStudy.images} columns={2} />
        </CaseStudySection>
      )}

      {caseStudy?.outcome && (
        <CaseStudySection title="Outcome" bgColor="#fafafa">
          <p>{caseStudy.outcome}</p>
        </CaseStudySection>
      )}

      {caseStudy?.testimonial && (
        <CaseStudySection>
          <blockquote className={styles.testimonial}>
            <p className={styles.quote}>
              &ldquo;{caseStudy.testimonial.quote}&rdquo;
            </p>
            <footer className={styles.author}>
              <strong>{caseStudy.testimonial.author}</strong>
              {caseStudy.testimonial.position && (
                <span>, {caseStudy.testimonial.position}</span>
              )}
            </footer>
          </blockquote>
        </CaseStudySection>
      )}

      {/* Prev/Next Navigation */}
      {(prevWork || nextWork) && (
        <section className={styles.navigation}>
          <Container>
            <div className={styles.navGrid}>
              {prevWork ? (
                <Link
                  href={`/work/${prevWork.slug}`}
                  className={styles.navLink}
                >
                  <div className={styles.navDirection}>← Previous</div>
                  <div className={styles.navTitle}>{prevWork.title}</div>
                </Link>
              ) : (
                <div className={styles.navPlaceholder}></div>
              )}

              {nextWork ? (
                <Link
                  href={`/work/${nextWork.slug}`}
                  className={styles.navLink}
                >
                  <div className={styles.navDirection}>Next →</div>
                  <div className={styles.navTitle}>{nextWork.title}</div>
                </Link>
              ) : (
                <div className={styles.navPlaceholder}></div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Contact Section */}
      <section className={styles.contact}>
        <Container>
          <SectionHeader
            title="Let's Work Together"
            sectionDescription={
              <>
                Interested in collaborating or have a project in mind? I&apos;d
                love to hear from you. Feel free to reach out via{" "}
                <a href="mailto:oleg.mokhniuk+hello@gmail.com">email</a> or
                connect with me on{" "}
                <a href="https://www.linkedin.com/in/mokhniuk/" target="_blank">
                  LinkedIn
                </a>
                .
              </>
            }
          />
        </Container>
      </section>
    </main>
  );
}
