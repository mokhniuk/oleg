import styles from "@/app/page.module.css";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import Container from "@/components/Container/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Retainer | Oleg Mokhniuk",
  description: "Retainer services, structure, and pricing for Oleg Mokhniuk",
};

export default function RetainerPage() {
  return (
    <main className={styles.main}>
      <CaseStudyHero
        title="Become a Retainer"
        description="Dedicated design and engineering services for your ongoing needs. I act as an extension of your team, providing consistent quality and reliability."
        bgColor="var(--color-bg-secondary)"
        client="For Teams & Startups"
      />

      <CaseStudySection title="Services">
        <p style={{ fontSize: "1.125rem", lineHeight: 1.6, color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
          My retainer services cover the full spectrum of product development, from initial design concepts to production-ready code.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Design & UX</h3>
            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "var(--color-text-secondary)" }}>
              <li>UI/UX Design</li>
              <li>Design Systems</li>
              <li>Prototyping</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Engineering</h3>
            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "var(--color-text-secondary)" }}>
              <li>Frontend Development</li>
              <li>React / Next.js</li>
              <li>Performance Optimization</li>
            </ul>
          </div>
        </div>
      </CaseStudySection>

      <CaseStudySection title="Structure">
        <div style={{ maxWidth: "680px" }}>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.6, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            The retainer model is built on trust and transparency. We agree on a set number of hours or deliverables per month, ensuring you have guaranteed availability.
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
                    <span style={{ fontWeight: 600 }}>Weekly Syncs:</span>
                    <span style={{ color: "var(--color-text-secondary)" }}>To align on priorities and progress.</span>
                </li>
                <li style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
                    <span style={{ fontWeight: 600 }}>Direct Communication:</span>
                    <span style={{ color: "var(--color-text-secondary)" }}>Slack/Discord access for quick questions.</span>
                </li>
                <li style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
                    <span style={{ fontWeight: 600 }}>Flexible Hours:</span>
                    <span style={{ color: "var(--color-text-secondary)" }}>Hours can be rolled over if unused (up to limit).</span>
                </li>
            </ul>
        </div>
      </CaseStudySection>

      <CaseStudySection title="Pricing">
        <div style={{ padding: "2rem", backgroundColor: "var(--color-bg-secondary)", borderRadius: "8px", maxWidth: "480px" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Standard Retainer</h3>
            <p style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>€X,XXX <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--color-text-secondary)" }}>/ month</span></p>
            <ul style={{ listStyle: "check", paddingLeft: "0", marginBottom: "2rem" }}>
                <li style={{ marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>Dedicated 20h / week</li>
                <li style={{ marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>Priority Support</li>
                <li style={{ marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>Quarterly Roadmap Review</li>
            </ul>
            <a href="mailto:oleg.mokhniuk+retainer@gmail.com" style={{ display: "inline-block", padding: "0.75rem 1.5rem", backgroundColor: "var(--color-text-primary)", color: "var(--color-bg-primary)", borderRadius: "4px", textDecoration: "none", fontWeight: 600 }}>
                Get in touch
            </a>
        </div>
      </CaseStudySection>
    </main>
  );
}
