import styles from "./case-study-hero.module.scss";
import Container from "@/components/Container/Container";
import Link from "next/link";

interface CaseStudyHeroProps {
    title: string;
    description: string;
    bgColor: string;
    role?: string;
    timeline?: string;
    stack?: string;
    url?: string;
    urlLabel?: string;
    url2?: string;
    urlLabel2?: string;
}

const CaseStudyHero: React.FC<CaseStudyHeroProps> = ({
    title,
    description,
    bgColor,
    role,
    timeline,
    stack,
    url,
    urlLabel,
    url2,
    urlLabel2,
}) => {
    return (
        <section className={styles.hero} style={{ backgroundColor: bgColor }}>
            <Container>
                <div className={styles.content}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.description}>{description}</p>

                    <div className={styles.details}>
                        {role && (
                            <div className={styles.detail}>
                                <h4>Role</h4>
                                <p>{role}</p>
                            </div>
                        )}
                        {timeline && (
                            <div className={styles.detail}>
                                <h4>Timeline</h4>
                                <p>{timeline}</p>
                            </div>
                        )}
                        {stack && (
                            <div className={styles.detail}>
                                <h4>Stack</h4>
                                <p>{stack}</p>
                            </div>
                        )}
                    </div>

                    {(url || url2) && (
                        <div className={styles.links}>
                            {url && (
                                <Link
                                    href={url}
                                    target="_blank"
                                    className={styles.link}
                                    title={title}
                                >
                                    {urlLabel || "Visit Website"}
                                </Link>
                            )}
                            {url2 && (
                                <Link
                                    href={url2}
                                    target="_blank"
                                    className={styles.link}
                                    title={title}
                                >
                                    {urlLabel2 || "Visit Website"}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default CaseStudyHero;
