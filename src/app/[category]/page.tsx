import { notFound } from "next/navigation";
import {
    getWorksByCategory,
    getCategoryMetadata,
    validateCategory,
} from "@/utils/categoryUtils";
import ProjectCard from "@/components/ProjectCard/ProjectCard";
import styles from "./category.module.scss";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{
        category: string;
    }>;
};

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;

    // Validate category exists
    if (!(await validateCategory(category))) {
        notFound();
    }

    const works = await getWorksByCategory(category);
    const metadata = getCategoryMetadata(category);

    return (
        <div className={styles.categoryPage}>
            <header className={styles.header}>
                <h1 className={styles.title}>{metadata.name}</h1>
                <p className={styles.description}>{metadata.description}</p>
                <p className={styles.count}>
                    {works.length} {works.length === 1 ? "project" : "projects"}
                </p>
            </header>

            <div className={styles.projectsGrid}>
                {works.map((work) => (
                    <ProjectCard
                        key={work.slug}
                        slug={work.slug}
                        bgColor={work.bgColor}
                        title={work.title}
                        description={work.description}
                        link={work.link}
                    />
                ))}
            </div>

            {works.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No projects found in this category yet.</p>
                </div>
            )}
        </div>
    );
}
