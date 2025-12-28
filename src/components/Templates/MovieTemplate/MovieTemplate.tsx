import React from "react";
import styles from "./movie-template.module.scss";
import Container from "@/components/Container/Container";
import { CaseStudyBlock } from "@/data/works";
import Image from "next/image";
import SectionHeader from "@/components/SectionHeader/SectionHeader";

interface MovieTemplateProps {
  title: string;
  description: string;
  bgColor: string;
  blocks?: CaseStudyBlock[];
  movieData?: {
    duration?: string;
    director?: string;
  };
  link?: {
      url: string;
      label: string;
  };
  coverImage?: string;
}

const MovieTemplate: React.FC<MovieTemplateProps> = ({
  title,
  description,
  bgColor,
  blocks,
  movieData,
  link,
  coverImage,
}) => {
  return (
    <div className={styles.movieTemplate}>
      <div className={styles.heroWrapper}>
          {coverImage && (
              <Image 
                src={coverImage} 
                alt={title} 
                fill 
                style={{objectFit: 'cover'}} 
                className={styles.heroImage}
                priority
              />
          )}
          <div className={styles.heroContent}>
            <Container>
                <div className={styles.heroText}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.description}>{description}</p>
                    
                    <div className={styles.meta}>
                        {movieData?.duration && <span>{movieData.duration}</span>}
                        {movieData?.director && <span>Directed by {movieData.director}</span>}
                    </div>

                    {link && (
                        <a href={link.url} className={styles.watchButton} target="_blank" rel="noopener noreferrer">
                             Watch Movie
                        </a>  
                    )}
                </div>
            </Container>
          </div>
      </div>

      <div className={styles.content}>
        <Container>
            {blocks?.map((block, index) => {
                 if (block.type === 'section') {
                     return (
                         <div key={index} className={styles.sectionBlock}>
                             <SectionHeader title={block.title || ""} titleColor="var(--color-contrast)" />
                             <p className={styles.text}>{block.content}</p>
                         </div>
                     )
                 }
                 // Add more block renderers as needed
                 return null;
            })}
        </Container>
      </div>
    </div>
  );
};

export default MovieTemplate;
