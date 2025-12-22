"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./project-card.module.scss";
import Link from "next/link";
import { preloadFonts } from "@/utils/fontLoader";
import { usePageTransition } from "@/contexts/PageTransitionContext";

interface ProjectCardProps {
  slug?: string;
  bgColor?: string;
  title: string;
  description: string;
  inProgress?: boolean;
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
  inProgress,
  link,
  fonts,
}) => {
  const router = useRouter();
  const { startTransition } = usePageTransition();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Determine the link destination
  // Priority: 1) Case study page if slug exists, 2) External link, 3) Fallback to #
  const href = (slug) ? `/work/${slug}` : (link?.url || "#");
  const target = (slug) ? undefined : "_blank";
  const rel = (slug) ? undefined : "noopener noreferrer";
  const inProgressClass = inProgress ? styles["in-progress"] : "";

  const handleMouseEnter = () => {
    if (slug) {
      setIsHovering(true);
      router.prefetch(href);
      preloadFonts(fonts, slug);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (slug) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (slug) {
      e.preventDefault();
      startTransition(bgColor);

      // Navigate after animation starts
      setTimeout(() => {
        router.push(href);
      }, 400);
    }
  };

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={styles.projectLink}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {slug && isHovering && (
        <div
          className={styles.bubble}
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            // backgroundColor: bgColor,
          }}
        >
          View case study
        </div>
      )}

      <div
        className={`${styles.project} ${inProgressClass}`}
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
