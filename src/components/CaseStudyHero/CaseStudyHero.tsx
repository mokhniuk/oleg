import styles from "./case-study-hero.module.scss";
import Container from "@/components/Container/Container";
import Link from "next/link";

interface CaseStudyHeroProps {
  title: string;
  description: string;
  bgColor: string;
  client?: string;
  releaseDate?: string;
  role?: string;
  link?: {
    url: string;
    label: string;
  };
  colors?: {
    primary: string;
    contrast: string;
    faded: string;
  };
  fonts?: {
    title: string;
    text: string;
  };
}

const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({
  title,
  description,
  bgColor,
  client,
  releaseDate,
  role,
  link,
  colors,
  fonts,
}) => {
  const customStyles = {
    backgroundColor: colors?.faded || bgColor,
    color: colors?.primary || "inherit",
    // CSS custom properties for use in child elements
    "--color-primary": colors?.primary || "#000",
    "--color-contrast": colors?.contrast || "#666",
    "--color-faded": colors?.faded || bgColor,
    "--font-title": fonts?.title ? `"${fonts.title}", serif` : "inherit",
    "--font-text": fonts?.text ? `"${fonts.text}", sans-serif` : "inherit",
  } as React.CSSProperties;

  return (
    <section className={styles.hero} style={customStyles}>
      <Container>
        <div className={styles.content}>
          <h1
            className={styles.title}
            style={{ fontFamily: fonts?.title ? `"${fonts.title}", serif` : undefined }}
          >
            {title}
          </h1>
          <p
            className={styles.description}
            style={{ fontFamily: fonts?.text ? `"${fonts.text}", sans-serif` : undefined }}
          >
            {description}
          </p>

          {(client || releaseDate || role || link) && (
            <div className={styles.headerDetails}>
              {link && (
                <div className={styles.headerDetail}>
                  <h4>Link</h4>
                  <Link
                    href={link.url}
                    target="_blank"
                    className={styles.headerLink}
                    title={title}
                  >
                    {link.label}
                  </Link>
                </div>
              )}
              {role && (
                <div className={styles.headerDetail}>
                  <h4>Role</h4>
                  <p>{role}</p>
                </div>
              )}
              {client && (
                <div className={styles.headerDetail}>
                  <h4>Client</h4>
                  <p>{client}</p>
                </div>
              )}
              {releaseDate && (
                <div className={styles.headerDetail}>
                  <h4>Release</h4>
                  <p>{releaseDate}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CaseStudyHero;
