import React from "react";
import styles from "./movie-template.module.scss";
import Container from "@/components/Container/Container";
import { CaseStudyBlock } from "@/data/works";
import Image from "next/image";
import SectionHeader from "@/components/SectionHeader/SectionHeader";

interface MovieTemplateProps {
  title: string;
  description: string;
  synopsis?: string;
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
  posterImage?: string;
  videoFile?: string;
  starring?: string[];
  laurels?: {
      quote?: string;
      award?: string;
      source?: string;
  }[];
  credits?: {
      role: string;
      name: string;
  }[];
}

const MovieTemplate: React.FC<MovieTemplateProps> = ({
  title,
  description,
  synopsis,
  blocks,
  movieData,
  coverImage,
  posterImage,
  videoFile,
  starring,
  laurels,
  credits,
}) => {
  return (
    <main className={styles.movieTemplate}>
      <section className={styles.heroWrapper}>
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
            <div className={styles.heroInner}>

              <div className={styles.heroText}>
                <div className={styles.starring}>
                  {starring?.map((actor, index) => (
                    <span key={index} className={styles.actor}>{actor}</span>
                  ))}
                </div>  
                <h1 className={styles.title}>{title}</h1>
              </div>

              <div className={styles.laurels}>
                {laurels?.map((laurel, index) => (
                  <div key={index} className={styles.laurelItem}>
                    <div className={styles.laurelText}>
                      {laurel.quote && <p className={styles.laurelQuote}>«{laurel.quote}»</p>}
                      <p className={styles.laurelSource}>{laurel.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </section>

      {synopsis && (
        <section className={styles.synopsisSection}>
            <Container>
                <div className={styles.synopsisWrapper}>
                     <p className={styles.synopsis}>{synopsis}</p>
                </div>
            </Container>
        </section>
      )}

      <section className={styles.videoSection} id="video">
        <Container>
          <div className={styles.videoWrapper}>
            {videoFile && (
                <video 
                  src={videoFile} 
                  controls 
                  poster={posterImage} 
                  className={styles.videoPlayer}
                />
            )}
          </div>
        </Container>
      </section>

      {credits && (
        <section className={styles.creditsSection}>
            <Container>
                <div className={styles.creditsWrapper}>
                    <h3 className={styles.creditsTitle}>Credtis</h3>
                    <div className={styles.creditsGrid}>
                        {credits.map((credit, index) => (
                            <div key={index} className={styles.creditItem}>
                                <span className={styles.creditRole}>{credit.role}</span>
                                <span className={styles.creditName}>{credit.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
      )}

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
    </main>
  );
};

export default MovieTemplate;
