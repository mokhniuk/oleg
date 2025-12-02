import styles from "./case-study-section.module.scss";
import Container from "@/components/Container/Container";

interface CaseStudySectionProps {
    title?: string;
    children: React.ReactNode;
    bgColor?: string;
    colors?: {
        primary: string;
        contrast: string;
        faded: string;
    };
    fonts?: {
        title: string;
        text: string;
    };
}

const CaseStudySection: React.FC<CaseStudySectionProps> = ({
    title,
    children,
    bgColor,
    colors,
    fonts,
}) => {
    const customStyles = {
        backgroundColor: bgColor || (colors?.faded ? `${colors.faded}15` : undefined),
        "--color-primary": colors?.primary || "#000",
        "--color-contrast": colors?.contrast || "#666",
        "--font-title": fonts?.title ? `"${fonts.title}", serif` : "inherit",
        "--font-text": fonts?.text ? `"${fonts.text}", sans-serif` : "inherit",
    } as React.CSSProperties;

    return (
        <section
            className={styles.section}
            style={customStyles}
        >
            <Container>
                {title && (
                    <h2
                        className={styles.title}
                        style={{ fontFamily: fonts?.title ? `"${fonts.title}", serif` : undefined }}
                    >
                        {title}
                    </h2>
                )}
                <div
                    className={styles.content}
                    style={{ fontFamily: fonts?.text ? `"${fonts.text}", sans-serif` : undefined }}
                >
                    {children}
                </div>
            </Container>
        </section>
    );
};

export default CaseStudySection;
