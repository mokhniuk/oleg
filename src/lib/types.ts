// Case-study content blocks
export type SectionBlock = {
  type: "section";
  title?: string;
  content: string;
  image?: string;
  bgColor?: string;
  titleColor?: "primary" | "contrast";
};

export type ImageBlock = { type: "image"; url: string; caption?: string };

export type GalleryBlock = {
  type: "gallery";
  images: string[];
  columns?: 1 | 2 | 3;
  titleColor?: "primary" | "contrast";
};

export type TestimonialBlock = {
  type: "testimonial";
  quote: string;
  author: string;
  position: string;
};

export type VideoBlock = { type: "video"; url: string; caption?: string };

export type ScreensGridBlock = {
  type: "screens-grid";
  bgColor?: string;
  images: string[];
  columns?: 2 | 3 | 4;
  titleColor?: "primary" | "contrast";
};

export type CaseStudyBlock =
  | SectionBlock
  | ImageBlock
  | VideoBlock
  | GalleryBlock
  | TestimonialBlock
  | ScreensGridBlock;

export const CATEGORIES = {
  WEB: "web",
  PRINT: "print",
  PHOTOGRAPHY: "photography",
  DEVELOPMENT: "development",
  DESIGN: "design",
  BRANDING: "branding",
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export type CaseStudy = {
  template?: "case-study" | "font" | "movie";
  fontFile?: string;
  downloadLink?: string;
  movieData?: { duration?: string; director?: string };
  task?: string;
  client?: string;
  releaseDate?: string;
  coverImage?: string;
  role?: string;
  link?: { url: string; label: string };
  colors?: { primary: string; contrast: string; faded: string };
  fonts?: {
    title: string;
    text?: string;
    customTitleFont?: boolean;
    customTextFont?: boolean;
  };
  overview?: string;
  roleDetails?: string;
  timeline?: string;
  stack?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  images?: string[];
  testimonial?: { quote: string; author: string; position: string };
  titleColor?: "primary" | "contrast";
  blocks?: CaseStudyBlock[];
  videoFile?: string;
  posterImage?: string;
  starring?: string[];
  laurels?: { quote?: string; award?: string; source?: string }[];
  credits?: { role: string; name: string }[];
};

export type WorksType = {
  id?: number;
  title: string;
  slug?: string;
  bgColor: string;
  description: string;
  synopsis?: string;
  categories: string[];
  link?: { url: string; label: string };
  link2?: { url: string; label: string };
  show: boolean;
  featured?: boolean;
  caseStudy?: CaseStudy;
  inProgress?: boolean;
  sortOrder?: number;
};

// Pet projects
export type PetProject = {
  id?: number;
  slug: string; // was `id` in the old data file
  title: string;
  icon: string;
  image: string;
  url: string;
  description: string;
  sortOrder?: number;
};

// DJ
export type DjEvent = {
  id?: number;
  date: string;
  venue: string;
  city: string;
  link?: string;
  sortOrder?: number;
};

export type DjRiderItem = { name: string; description: string; image: string };

export type DjInfo = {
  summary: string;
  technicalRider: DjRiderItem[];
  bookingEmail: string;
  photos: string[];
  partners: string[];
};

// CV
export type CvContent = {
  topSkills: string[];
  personalInfo: {
    name: string;
    title: string;
    website: string;
    email: string;
  };
  summary: string;
  experience: {
    position: string;
    company: string;
    period: string;
    type: string;
    location: string;
    description: string;
  }[];
  stack: Record<string, string[]>;
  languages: { language: string; level: string }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    period: string;
    location: string;
  }[];
};
export type Cv = CvContent;
