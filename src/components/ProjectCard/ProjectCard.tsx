import { Url } from "next/dist/shared/lib/router/router";
import styles from "./project-card.module.scss";
import Link from "next/link";

interface ProjectCardProps {
  slug: string;
  imageUrl?: Url;
  bgColor?: string;
  title: string;
  description: string;
  platformsDescription?: string;
  stack?: string;
  url?: Url;
  urlLabel?: string;
  url2?: Url;
  urlLabel2?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  slug,
  imageUrl,
  bgColor = "#fafafa",
  title,
  platformsDescription,
  stack,
  url,
  urlLabel,
  url2,
  urlLabel2,
  description,
}) => {
  return (
    <Link href={`/work/${slug}`} className={styles.projectLink}>
      <div
        className={styles.project}
        style={{
          backgroundImage: `url(` + imageUrl + `)`,
          backgroundColor: bgColor,
        }}
      >
        <div className={styles["project-description"]}>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
          {platformsDescription && <p>{platformsDescription}</p>}

          {url && (
            <p>
              <span className={styles["project__link"]}>{urlLabel}</span>
            </p>
          )}

          {url2 && (
            <p>
              <span className={styles["project__link"]}>{urlLabel2}</span>
            </p>
          )}
          {stack && (
            <p>
              <small>{stack}</small>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
ProjectCard;

