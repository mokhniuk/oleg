import styles from "./case-study-section.module.scss";
import Container from "@/components/Container/Container";

interface CaseStudySectionProps {
    title?: string;
    children: React.ReactNode;
    bgColor?: string;
    titleColor?: string;
}

const CaseStudySection: React.FC<CaseStudySectionProps> = ({
    title,
    children,
    bgColor,
    titleColor,
}) => {
    return (
        <section
            className={styles.section}
            style={bgColor ? { backgroundColor: bgColor } : undefined}
        >
            <Container>
                {title && (
                    <h2
                        className={styles.title}
                        style={titleColor ? { color: titleColor } : undefined}
                    >
                        {title}
                    </h2>
                )}
                <div className={styles.content}>
                    {children}
                </div>
            </Container>
        </section>
    );
};

export default CaseStudySection;
