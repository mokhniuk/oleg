"use client";

import { useRouter } from "next/navigation";
import styles from "./project-card.module.scss";
import Link from "next/link";
import { preloadFonts } from "@/utils/fontLoader";

interface ProjectCardProps {
  slug?: string;
  bgColor?: string;
  title: string;
  description: string;
  link?: {
    url: string;
    label: string;
  };
  fonts?: {
    title: string;
    text: string;
    customTitleFont?: boolean;
    customTextFont?: boolean;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  slug,
  bgColor = "#fafafa",
  title,
  description,
  link,
  fonts,
}) => {
  const router = useRouter();

  // Determine the link destination
  // Priority: 1) Case study page if slug exists, 2) External link, 3) Fallback to #
  const href = (slug) ? `/work/${slug}` : (link?.url || "#");
  const target = (slug) ? undefined : "_blank";
  const rel = (slug) ? undefined : "noopener noreferrer";

  const handleMouseEnter = () => {
    if (slug) {
        router.prefetch(href);
        preloadFonts(fonts, slug);
    }
  };

  return (
    <Link 
        href={href} 
        target={target} 
        rel={rel} 
        className={styles.projectLink}
        onMouseEnter={handleMouseEnter}
    >
      <div
        className={styles.project}
        style={{
          backgroundColor: bgColor,
          pointerEvents: "none",
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
