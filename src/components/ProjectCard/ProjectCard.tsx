import { Url } from "next/dist/shared/lib/router/router";
import styles from "./project-card.module.scss";
import Link from "next/link";

interface ProjectCardProps {
  slug: string;
  bgColor?: string;
  title: string;
  description: string;
  link?: {
    url: string;
    label: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  slug,
  bgColor = "#fafafa",
  title,
  description,
  link,
}) => {
  return (
    <Link href={`/work/${slug}`} className={styles.projectLink}>
      <div
        className={styles.project}
        style={{
          backgroundColor: bgColor,
        }}
      >
        <div className={styles["project-description"]}>
          <h3>{title}</h3>
          {description && <p>{description}</p>}

          {link && (
            <p>
              <span className={styles["project__link"]}>{link.label}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
ProjectCard;
