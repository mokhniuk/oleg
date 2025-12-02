import styles from "./case-study-hero.module.scss";
import Container from "@/components/Container/Container";
import Link from "next/link";

interface CaseStudyHeroProps {
  title: string;
  description: string;
  bgColor: string;
  task?: string;
  releaseDate?: string;
  role?: string;
  link?: {
    url: string;
    label: string;
  };
}

const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({
  title,
  description,
  bgColor,
  task,
  releaseDate,
  role,
  link,
}) => {
  return (
    <section className={styles.hero} style={{ backgroundColor: bgColor }}>
      <Container>
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>

          {(task || releaseDate || role || link) && (
            <div className={styles.headerDetails}>
              {task && (
                <div className={styles.headerDetail}>
                  <h4>Task</h4>
                  <p>{task}</p>
                </div>
              )}
              {releaseDate && (
                <div className={styles.headerDetail}>
                  <h4>Release</h4>
                  <p>{releaseDate}</p>
                </div>
              )}
              {role && (
                <div className={styles.headerDetail}>
                  <h4>Role</h4>
                  <p>{role}</p>
                </div>
              )}
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
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default CaseStudyHero;
