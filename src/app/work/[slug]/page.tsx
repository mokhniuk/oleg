import { WORKS } from "@/data/works";
import { notFound } from "next/navigation";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import styles from "./page.module.scss";

interface CaseStudyPageProps {
    params: {
        slug: string;
    };
}

// Generate static params for all works
export async function generateStaticParams() {
    return WORKS.map((work) => ({
        slug: work.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CaseStudyPageProps) {
    const work = WORKS.find((w) => w.slug === params.slug);

    if (!work) {
        return {
            title: "Not Found",
        };
    }

    return {
        title: `${work.title} - Oleg Mokhniuk`,
        description: work.description,
    };
}

export default function CaseStudyPage({ params }: CaseStudyPageProps) {
    const work = WORKS.find((w) => w.slug === params.slug);

    if (!work) {
        notFound();
    }

    const { caseStudy } = work;

    return (
        <main className={styles.main}>
            <CaseStudyHero
                title={work.title}
                description={work.description}
                bgColor={work.bgColor}
                role={caseStudy?.role}
                timeline={caseStudy?.timeline}
                stack={work.stack}
                url={work.url}
                urlLabel={work.urlLabel}
                url2={work.url2}
                urlLabel2={work.urlLabel2}
            />

            {caseStudy?.overview && (
                <CaseStudySection title="Overview">
                    <p>{caseStudy.overview}</p>
                </CaseStudySection>
            )}

            {caseStudy?.challenge && (
                <CaseStudySection title="Challenge" bgColor="#fafafa">
                    <p>{caseStudy.challenge}</p>
                </CaseStudySection>
            )}

            {caseStudy?.solution && (
                <CaseStudySection title="Solution">
                    <p>{caseStudy.solution}</p>
                </CaseStudySection>
            )}

            {caseStudy?.images && caseStudy.images.length > 0 && (
                <CaseStudySection>
                    <ImageGallery images={caseStudy.images} columns={2} />
                </CaseStudySection>
            )}

            {caseStudy?.outcome && (
                <CaseStudySection title="Outcome" bgColor="#fafafa">
                    <p>{caseStudy.outcome}</p>
                </CaseStudySection>
            )}

            {caseStudy?.testimonial && (
                <CaseStudySection>
                    <blockquote className={styles.testimonial}>
                        <p className={styles.quote}>"{caseStudy.testimonial.quote}"</p>
                        <footer className={styles.author}>
                            <strong>{caseStudy.testimonial.author}</strong>
                            {caseStudy.testimonial.position && (
                                <span>, {caseStudy.testimonial.position}</span>
                            )}
                        </footer>
                    </blockquote>
                </CaseStudySection>
            )}

            {work.platformsDescription && (
                <CaseStudySection>
                    <p>{work.platformsDescription}</p>
                </CaseStudySection>
            )}
        </main>
    );
}
