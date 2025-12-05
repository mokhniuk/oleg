import { WORKS, CaseStudyBlock } from "@/data/works";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container/Container";
import SectionHeader from "@/components/SectionHeader/SectionHeader";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import ScreensGrid from "@/components/ScreensGrid/ScreensGrid";
import BrowserFrame from "@/components/BrowserFrame/BrowserFrame";
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
  link?: {
    url: string;
    label: string;
  };
  coverImage?: string;
  blocks: CaseStudyBlock[];
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

  // Generate Google Fonts URL or custom font styles
  const getFontsStyles = () => {
    if (!work.caseStudy?.fonts) return null;

    const { title, text, customTitleFont, customTextFont } = work.caseStudy.fonts;

    // If both fonts are custom, inject @font-face rules
    if (customTitleFont && customTextFont) {
      return `
        @font-face {
          font-family: "${title}";
          src: url('/fonts/${title.replace(/ /g, '-')}.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: "${text}";
          src: url('/fonts/${text.replace(/ /g, '-')}.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
      `;
    }

    // If only title font is custom
    if (customTitleFont && !customTextFont) {
      const googleFonts = [text].filter(Boolean).map(font => font.replace(/ /g, '+')).join('&family=');
      return `
        @import url('https://fonts.googleapis.com/css2?family=${googleFonts}&display=swap');
        @font-face {
          font-family: "${title}";
          src: url('/fonts/${title.replace(/ /g, '-')}.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
      `;
    }

    // If only text font is custom
    if (!customTitleFont && customTextFont) {
      const googleFonts = [title].filter(Boolean).map(font => font.replace(/ /g, '+')).join('&family=');
      return `
        @import url('https://fonts.googleapis.com/css2?family=${googleFonts}&display=swap');
        @font-face {
          font-family: "${text}";
          src: url('/fonts/${text.replace(/ /g, '-')}.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
      `;
    }

    // Both fonts from Google
    const googleFonts = [title, text]
      .filter(Boolean)
      .map(font => font.replace(/ /g, '+'))
      .join('&family=');
    return `@import url('https://fonts.googleapis.com/css2?family=${googleFonts}&display=swap');`;
  };

  const fontsStyles = getFontsStyles();

  const mainStyles = {
    "--font-title": work.caseStudy?.fonts?.title ? `"${work.caseStudy.fonts.title}", serif` : "inherit",
    "--font-text": work.caseStudy?.fonts?.text ? `"${work.caseStudy.fonts.text}", sans-serif` : "inherit",
    "--color-primary": work.caseStudy?.colors?.primary || "#000",
    "--color-contrast": work.caseStudy?.colors?.contrast || "#666",
    "--color-faded": work.caseStudy?.colors?.faded || work.bgColor,
    fontFamily: work.caseStudy?.fonts?.text ? `"${work.caseStudy.fonts.text}", sans-serif` : undefined,
  } as React.CSSProperties;

  return (
    <>
      {fontsStyles && (
        <style dangerouslySetInnerHTML={{
          __html: fontsStyles
        }} />
      )}
      <main className={styles.main} style={mainStyles}>
        <CaseStudyHero
          title={work.title}
          description={work.description}
          bgColor={work.bgColor}
          client={caseStudy?.client}
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
              style={{ objectFit: "cover", backgroundColor: work.bgColor }}
              priority
            />
          </figure>
        )}

        {caseStudy?.blocks?.map((block, index) => {
          // Auto-apply background color based on index for visual rhythm
          const getAutoBgColor = () => {
            if (block.type === "section" && !block.bgColor && work.caseStudy?.colors?.faded) {
              // Alternate between no background and faded background
              return index % 2 === 1 ? work.caseStudy.colors.faded : undefined;
            }
            return undefined;
          };

          switch (block.type) {
            case "section":
              return (
                <CaseStudySection
                  key={index}
                  title={block.title}
                  bgColor={block.bgColor || getAutoBgColor()}
                >
                  <p>{block.content}</p>
                  {block.image && (
                    <Image
                      src={block.image}
                      alt=""
                      fill
                      style={{ objectFit: "cover", backgroundColor: work.bgColor }}
                      className={styles.blockImage}
                    />
                  )}
                </CaseStudySection>
              );
            case "image":
              return (
                <section key={index} >
                  <figure className={styles.caseStudyCoverImage}>
                    <Image
                      src={block.url}
                      alt={block.caption || ""}
                      fill
                      style={{ objectFit: "cover", backgroundColor: work.bgColor }}
                      className={styles.blockImage}
                    />
                    {block.caption && (
                      <p className={styles.caption}>{block.caption}</p>
                    )}
                  </figure>
                </section>
              );
            case "video":
              return (
                <section className={styles["video-section"]} key={index}>
                  <Container>
                    <BrowserFrame className={styles.caseStudyVideo}>
                      <video
                        src={block.url}
                        autoPlay={true}
                        loop={true}
                        muted={true}
                        style={{ backgroundColor: work.bgColor }}
                        className={styles.blockVideo}
                      />
                    </BrowserFrame>
                  </Container>
                </section>
              );
            case "gallery":
              return (
                <CaseStudySection
                  key={index}
                >
                  <ImageGallery
                    images={block.images}
                    columns={block.columns || 2}
                  />
                </CaseStudySection>
              );
            case "testimonial":
              return (
                <CaseStudySection
                  key={index}
                >
                  <blockquote className={styles.testimonial}>
                    <p className={styles.quote}>&ldquo;{block.quote}&rdquo;</p>
                    <footer className={styles.author}>
                      <strong>{block.author}</strong>
                      {block.position && <span>, {block.position}</span>}
                    </footer>
                  </blockquote>
                </CaseStudySection>
              );
            case "screens-grid":
              return (
                <CaseStudySection
                  key={index}
                >
                  <ScreensGrid
                    images={block.images}
                  />
                </CaseStudySection>
              );
            default:
              return null;
          }
        })}

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
    </>
  );
}
