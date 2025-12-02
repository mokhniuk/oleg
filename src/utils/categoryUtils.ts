import { WORKS } from "@/data/works";

/**
 * Get all works that belong to a specific category
 */
export function getWorksByCategory(category: string) {
    return WORKS.filter(
        (work) => work.show && work.categories.includes(category.toLowerCase())
    );
}

/**
 * Get all unique categories from all works
 */
export function getAllCategories(): string[] {
    const categoriesSet = new Set<string>();
    WORKS.forEach((work) => {
        if (work.show) {
            work.categories.forEach((category) => categoriesSet.add(category));
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
export function validateCategory(category: string): boolean {
    const allCategories = getAllCategories();
    return allCategories.includes(category.toLowerCase());
}

/**
 * Get count of works in a category
 */
export function getCategoryCount(category: string): number {
    return getWorksByCategory(category).length;
}
