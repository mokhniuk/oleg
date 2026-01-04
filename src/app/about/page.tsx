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
        description=""
        bgColor="#fafafa"
      />

      <CaseStudySection >
        <div style={{ maxWidth: 800 }}>
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            {/* I was born in 1992 and raised in Kyiv, Ukraine.  */}
            Since I was a kid, I was interested in computers, loved music and photography. I hold a Bachelor's degree in Applied Physics and a Master of Science in High Technologies (Physics, Chemistry, and Biology) from Taras Shevchenko National University of Kyiv. I have been working as a web developer since 2009, and in 2016 I moved to Germany to continue my career as a frontend engineer in product companies. 
          </p>

          {/* <div
              style={{
                width: "100%",
                height: "600px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="./images/about/oleg-xs.jpg" alt="kid" className={styles['about-img']} />
            </div> */}

          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Beyond interfaces and development, I’m passionate about an analog lifestyle: I collect vinyl records, perform as a DJ, and practice film photography — mostly street and portrait work. Occasionally, you might also catch me doing stand-up comedy.
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
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="./images/dj/1.jpg" alt="DJ" className={styles['about-img']} />
            </div>
            <div
              style={{
                width: "100%",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="./images/about/photo.jpg" alt="Standup Comedy" className={styles['about-img']} />
            </div>

            {/* <div
              style={{
                width: "100%",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="./images/about/comedy.jpg" alt="Standup Comedy" className={styles['about-img']} />
            </div> */}
          </div>
        </div>
      </CaseStudySection>

      <CaseStudySection title="CV">
        <p style={{
          fontSize: "1.125rem",
          lineHeight: 1.6,
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
        }}>
          I have over 17 years of total experience in web- and frontend development, UI/UX design, working with various clients and companies to deliver high-quality digital products.
        </p>
        <Link href="/cv" className={styles['cv-button']}>
          View full CV
        </Link>
      </CaseStudySection>
    </main>
  );
}
