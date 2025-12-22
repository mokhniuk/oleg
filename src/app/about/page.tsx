import styles from "@/app/page.module.css";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import { CV } from "@/data/cv";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Oleg Mokhniuk",
  description: "About Oleg Mokhniuk - Frontend Engineer and Designer",
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <CaseStudyHero
        title="About"
        description={CV.summary}
        bgColor="#fafafa"
      />

      <CaseStudySection title="Background">
        <div style={{ maxWidth: 800 }}>
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Born and raised in Kyiv, Ukraine, I spent my formative years exploring
            the intersection of science and art. My academic background is rooted
            in science—I hold a Master&apos;s degree in Physics, Chemistry, and
            Biology from the Taras Shevchenko National University of Kyiv. This
            scientific foundation gave me a rigorous approach to problem-solving,
            which I now apply to engineering and design.
          </p>

          <div
            style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "2rem",
              borderRadius: "8px",
            }}
          >
            <span style={{ color: "#999" }}>
              [Placeholder: Childhood photo with camera]
            </span>
          </div>

          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Beyond the screen, I am passionate about analog mediums. I collect
            vinyl records and perform as a DJ, finding rhythm and flow that often
            inspires my digital work. I also practice film photography, capturing
            moments with a deliberate patience that contrasts with the fast-paced
            tech world. Occasionally, you might even catch me doing stand-up
            comedy—because sometimes you just have to laugh at the complexity of
            it all.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "300px",
                backgroundColor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              <span style={{ color: "#999" }}>
                [Placeholder: DJing/Vinyl photo]
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "300px",
                backgroundColor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              <span style={{ color: "#999" }}>[Placeholder: Standup photo]</span>
            </div>
          </div>
        </div>
      </CaseStudySection>

      <CaseStudySection title="Experience">
        <p style={{
          fontSize: "1.125rem",
          lineHeight: 1.6,
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
        }}>
          I have over 10 years of experience in frontend engineering and UI/UX design, working with various clients and companies to deliver high-quality digital products.
        </p>
        <Link href="/cv" className={styles['cv-button']}>
          View full CV
        </Link>
      </CaseStudySection>
    </main>
  );
}
