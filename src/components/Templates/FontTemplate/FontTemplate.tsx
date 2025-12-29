"use client";

import React, { useState, useEffect } from "react";
import styles from "./font-template.module.scss";
import Container from "@/components/Container/Container";
import { CaseStudyBlock } from "@/data/works";
import Image from "next/image";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";

interface FontTemplateProps {
  title: string;
  description: string;
  bgColor: string;
  fontFile?: string;
  downloadLink?: string;
  blocks?: CaseStudyBlock[];
  fonts?: {
    title: string;
    text: string;
    customTitleFont?: boolean;
    customTextFont?: boolean;
  };
}

const FontTemplate: React.FC<FontTemplateProps> = ({
  title,
  description,
  bgColor,
  fontFile,
  downloadLink,
  blocks,
  fonts,
}) => {
  const [fontSize, setFontSize] = useState(64);
  const [testText, setTestText] = useState("When zombies arrive, quickly fax Judge Pat.");

  // Load custom font if provided
  useEffect(() => {
    if (fontFile && fonts?.title) {
      const font = new FontFace(fonts.title, `url(${fontFile})`);
      font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
      }).catch((err) => {
        console.error("Failed to load font:", err);
      });
    }
  }, [fontFile, fonts]);

  const fontStyle = {
    fontFamily: fonts?.title || "inherit",
  };

  return (
    <main className={styles.fontTemplate} style={{ backgroundColor: bgColor }}>
      <Container>
        <header className={styles.header}>
          <h1 className={styles.title} style={fontStyle}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
          {downloadLink && (
            <a href={downloadLink} className={styles.downloadButton} target="_blank" rel="noopener noreferrer">
              Download Font
            </a>
          )}
        </header>

        <section className={styles.playground}>
          <div className={styles.controls}>
            <label htmlFor="fontSize">Size: {fontSize}px</label>
            <input
              type="range"
              id="fontSize"
              min="12"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>
          <textarea
            className={styles.palygroundInput}
            style={{ ...fontStyle, fontSize: `${fontSize}px` }}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            spellCheck={false}
          />
        </section>

        <section className={styles.specimen}>
          <div className={styles.specimenGrid} style={fontStyle}>
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => (
                <span key={char}>{char}</span>
            ))}
          </div>
          <div className={styles.specimenGrid} style={fontStyle}>
            {"abcdefghijklmnopqrstuvwxyz".split("").map(char => (
                <span key={char}>{char}</span>
            ))}
          </div>
          {/* <div className={styles.specimenGrid} style={fontStyle}>
            {"АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ".split("").map(char => (
                <span key={char}>{char}</span>
            ))}
          </div>
          <div className={styles.specimenGrid} style={fontStyle}>
            {"абвгґдеєжзиіїйклмнопрстуфхцчшщьюя".split("").map(char => (
                <span key={char}>{char}</span>
            ))}
          </div> */}
          <div className={styles.specimenGrid} style={fontStyle}>
            {"0123456789!@#$%^&*()".split("").map(char => (
                <span key={char}>{char}</span>
            ))}
          </div>
        </section>

      </Container>

      {blocks?.map((block, index) => {
          switch (block.type) {
            case "section":
              return (
                <CaseStudySection
                  key={index}
                  title={block.title}
                  bgColor={block.bgColor}
                >
                  <p>{block.content}</p>
                  {block.image && (
                    <Image
                      src={block.image}
                      alt=""
                      fill
                      style={{ objectFit: "cover" }}
                      className={styles.blockImage}
                    />
                  )}
                </CaseStudySection>
              );
            case "image":
              return (
                <section key={index} className={styles.imageSection}>
                  <figure className={styles.blockFigure}>
                    <Image
                      src={block.url}
                      alt={block.caption || ""}
                      width={1200}
                      height={630}
                      style={{ width: "100%", height: "auto" }}
                    />
                    {block.caption && (
                      <p className={styles.caption}>{block.caption}</p>
                    )}
                  </figure>
                </section>
              );
            default:
              return null;
          }
        })}
    </main>
  );
};

export default FontTemplate;
