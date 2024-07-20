import { Url } from "next/dist/shared/lib/router/router";
import styles from "./project-card.module.scss";
import Link from "next/link";

interface ProjectCardProps {
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
            <Link
              href={url}
              title={title}
              target="_blank"
              className={styles["project__link"]}
            >
              {urlLabel}
            </Link>
          </p>
        )}

        {url2 && (
          <p>
            <Link
              href={url2}
              title={title}
              target="_blank"
              className={styles["project__link"]}
            >
              {urlLabel2}
            </Link>
          </p>
        )}
        {stack && (
          <p>
            <small>{stack}</small>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
ProjectCard;
