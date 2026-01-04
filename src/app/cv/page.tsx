import styles from "@/app/page.module.css";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import Container from "@/components/Container/Container";
import { CV } from "@/data/cv";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV | Oleg Mokhniuk",
  description: "Curriculum Vitae of Oleg Mokhniuk - Frontend Engineer and Designer",
};

export default function CVPage() {
  return (
    <main className={styles.main}>
      <CaseStudyHero
        title="Resume"
        description={CV.summary}
        bgColor="#fafafa"
      />

      <CaseStudySection title="Experience">
        <ul style={{ listStyle: "none", padding: 0 }}>
          {CV.experience.map((job, index) => (
            <li key={index} style={{ marginBottom: "3rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                {job.position}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "0.75rem",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{job.company}</span>
                <span>•</span>
                <span>{job.period}</span>
                <span>•</span>
                <span>{job.location}</span>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                }}
              >
                {job.description}
              </p>
            </li>
          ))}
        </ul>
      </CaseStudySection>

      <CaseStudySection title="Education">
        <ul style={{ listStyle: "none", padding: 0 }}>
          {CV.education.map((edu, index) => (
            <li key={index} style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                {edu.institution}
              </h3>
              <p style={{ marginBottom: "0.25rem" }}>{edu.degree} in {edu.field}</p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                {edu.period}, {edu.location}
              </p>
            </li>
          ))}
        </ul>
      </CaseStudySection>

          

      <CaseStudySection title="Languages">
        <ul style={{ listStyle: "none", padding: 0 }}>
          {CV.languages.map((lang, index) => (
            <li key={index} style={{ marginBottom: "0.5rem", display: "flex", gap: "1rem" }}>
              <span style={{ fontWeight: 600 }}>{lang.language}</span> —
              <span style={{ color: "var(--color-text-secondary)" }}>{lang.level}</span>
            </li>
          ))}
        </ul>
      </CaseStudySection>

    </main>
  );
}
