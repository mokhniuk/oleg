import { getAllWorks } from "@/lib/repositories/works";

/**
 * Get all works that belong to a specific category
 */
export async function getWorksByCategory(category: string) {
    return (await getAllWorks()).filter(
        (work) => work.show && work.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
}

/**
 * Get all unique categories from all works
 */
export async function getAllCategories(): Promise<string[]> {
    const categoriesSet = new Set<string>();
    (await getAllWorks()).forEach((work) => {
        if (work.show) {
            work.categories.forEach((category) => categoriesSet.add(category.toLowerCase()));
        }
    });
    return Array.from(categoriesSet).sort();
}

/**
 * Get metadata for a specific category
 */
export function getCategoryMetadata(category: string): {
    name: string;
    description: string;
} {
    const categoryLower = category.toLowerCase();

    const metadata: Record<string, { name: string; description: string }> = {
        web: {
            name: "Web",
            description: "Web design and development projects",
        },
        development: {
            name: "Development",
            description: "Software development and engineering projects",
        },
        design: {
            name: "Design",
            description: "UI/UX design and visual design projects",
        },
        print: {
            name: "Print",
            description: "Print design and graphic design projects",
        },
        photography: {
            name: "Photography",
            description: "Photography and visual storytelling projects",
        },
        branding: {
            name: "Branding",
            description: "Brand identity and branding projects",
        },
    };

    return (
        metadata[categoryLower] || {
            name: category.charAt(0).toUpperCase() + category.slice(1),
            description: `${category} projects`,
        }
    );
}

/**
 * Check if a category exists in the works data
 */
export async function validateCategory(category: string): Promise<boolean> {
    const allCategories = await getAllCategories();
    return allCategories.includes(category.toLowerCase());
}

/**
 * Get count of works in a category
 */
export async function getCategoryCount(category: string): Promise<number> {
    return (await getWorksByCategory(category)).length;
}
