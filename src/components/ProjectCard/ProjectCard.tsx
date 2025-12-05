import { Url } from "next/dist/shared/lib/router/router";
import styles from "./project-card.module.scss";
import Link from "next/link";

interface ProjectCardProps {
  slug?: string;
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
  // Determine the link destination
  // Priority: 1) Case study page if slug exists, 2) External link, 3) Fallback to #
  const href = (slug) ? `/work/${slug}` : (link?.url || "#");
  const target = (slug) ? undefined : "_blank";
  const rel = (slug) ? undefined : "noopener noreferrer";

  return (
    <Link href={href} target={target} rel={rel} className={styles.projectLink}>
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
