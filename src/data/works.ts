export type SectionBlock = {
  type: "section";
  title?: string;
  content: string;
  image?: string;
  bgColor?: string;
  titleColor?: "primary" | "contrast";
};

export type ImageBlock = {
  type: "image";
  url: string;
  caption?: string;
};

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

export type VideoBlock = {
  type: "video";
  url: string;
  caption?: string;
};

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

// Category constants for type safety
export const CATEGORIES = {
  WEB: 'web',
  PRINT: 'print',
  PHOTOGRAPHY: 'photography',
  DEVELOPMENT: 'development',
  DESIGN: 'design',
  BRANDING: 'branding',
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

type CaseStudy = {
  // Template type
  template?: 'case-study' | 'font' | 'movie';
  
  // Font specific fields
  fontFile?: string;
  downloadLink?: string;
  
  // Movie specific fields
  movieData?: {
    duration?: string;
    director?: string;
    // Add other specific movie fields if needed
  };

  // Header information (short overview)
  task?: string;
  client?: string;
  releaseDate?: string;
  coverImage?: string;
  role?: string;
  link?: {
    url: string;
    label: string;
  };
  // Color palette for the project
  colors?: {
    primary: string;      // Main brand color
    contrast: string;     // Opposite/complementary color
    faded: string;        // 5-10% opacity of primary for backgrounds
  };
  // Font pairing for the project
  fonts?: {
    title: string;        // Font for headings/titles
    text?: string;         // Font for body text
    customTitleFont?: boolean;  // If true, load from /fonts/ instead of Google
    customTextFont?: boolean;   // If true, load from /fonts/ instead of Google
  };
  // Body sections (detailed content)
  overview?: string;
  roleDetails?: string;
  timeline?: string;
  stack?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  images?: string[];
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  titleColor?: 'primary' | 'contrast';
  blocks?: CaseStudyBlock[];
  videoFile?: string;
  posterImage?: string;
  starring?: string[]; // Array of actor names
  laurels?: {
      quote?: string;
      award?: string;
      source?: string;
  }[];
  credits?: {
      role: string;
      name: string;
  }[];
};

type WorksType = {
  title: string;
  slug?: string;
  bgColor: string;
  description: string;
  synopsis?: string;
  categories: string[]; // Array of category tags
  link?: {
    url: string;
    label: string;
  };
  link2?: {
    url: string;
    label: string;
  };
  show: boolean;
  featured?: boolean;
  caseStudy?: CaseStudy;
  inProgress?: boolean;
};

export const WORKS: WorksType[] = [
  {
    slug: "bagel-bro",
    bgColor: "#feeadd",
    title: "Bagel Bro",
    description: "Designed and developed website for bagel place in Berlin.",
    categories: ["web", "development", "design", "photography"],
    inProgress: true,
    link: {
      url: "https://bagelbro.de",
      label: "bagelbro.de",
    },
    show: true,
    featured: true,
    caseStudy: {
      coverImage: "../../projects/bagel-bro/bagelbro--cover2.webp",
      task: "Create modern, appetizing website for Berlin bagel shop",
      releaseDate: "2025",
      role: "Designer & Developer",
      client: "Bagel Bro",
      link: {
        url: "https://bagelbro.de",
        label: "bagelbro.de",
      },
      colors: {
        primary: "#E7650D",
        contrast: "#1F6686",
        faded: "#fafafa",
      },
      fonts: {
        title: "HelveticaNeue",
        text: "HelveticaNeue",
        customTitleFont: true,
        customTextFont: true,
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/bagel-bro/bagelbro.webm",
          caption: "Bagel Bro cover video",
        },
        {
          type: "section",
          title: "Overview",
          bgColor: "#feeadd",
          content:
            "Bagel Bro needed a fresh, inviting online presence that would capture the essence of their bagel shop in Berlin, menu, catering and careers information.",
        },
        {
          type: "screens-grid",
          bgColor: "#feeadd",
          images: [
            "../../projects/bagel-bro/screens/screen--1.jpg",
            "../../projects/bagel-bro/screens/screen--2.jpg",
            "../../projects/bagel-bro/screens/screen--3.jpg",
            "../../projects/bagel-bro/screens/screen--4.jpg",
            "../../projects/bagel-bro/screens/screen--5.jpg"
          ],
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "Figma, Wordpress, HTML, CSS, JS, PHP, MySQL.",
        },
        // {
        //   type: "testimonial",
        //   quote:
        //     "Oleg helped us create this website! We are so grateful for his expertise and support. He was always available to answer our questions and provided us with clear and concise guidance. We highly recommend Oleg for any web development project.",
        //   author: "Anastasiia Mizko & Oleksandr Danylin",
        //   position:
        //     "Founders of Bagel Bro",
        // },

        {
          type: "image",
          url: "../../projects/bagel-bro/store.webp",
        }
      ],
    },
  },
  {
    slug: "u-bar",
    bgColor: "#ffffd1",
    title: "U Bar Berlin",
    description: "Designed website for amazing speakeasy bar in Berlin.",
    categories: ["web", "design"],
    link: {
      url: "https://ubar.me",
      label: "ubar.me",
    },
    show: true,
    featured: true,
    caseStudy: {
      coverImage: "../../projects/u-bar/ubar--cover.jpg",
      task: "Design sophisticated website for Berlin speakeasy bar",
      releaseDate: "2024",
      role: "Design & Development",
      client: "U Bar",
      link: {
        url: "https://ubar.me",
        label: "ubar.me",
      },
      titleColor: "contrast",
      colors: {
        primary: "#EBEB6F",
        contrast: "#141414",
        faded: "#ffffd1",
      },
      fonts: {
        title: "Instrument Serif",
        text: "Roboto Sans",
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/u-bar/ubar.webm",
          caption: "U Bar Berlin cover video",
        },
        {
          type: "section",
          title: "Overview",
          bgColor: "#ffffd1",
          content:
            "U Bar is a hidden gem of Berlin. It needed a website reflecting its minimalist, stylish and sophisticated atmosphere. I've designed a modular responsive website that allows to display the bar's schedule, menu, contact information in a clear and easy-to-navigate way. ",
        },
        {
          type: "screens-grid",
          bgColor: "#ffffd1",
          images: [
            "../../projects/u-bar/screens/screen--1.jpg",
            "../../projects/u-bar/screens/screen--2.jpg",
            "../../projects/u-bar/screens/screen--3.jpg",
            "../../projects/u-bar/screens/screen--4.jpg",
            "../../projects/u-bar/screens/screen--5.jpg",
            "../../projects/u-bar/screens/screen--6.jpg",
            "../../projects/u-bar/screens/screen--7.jpg",
          ],
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Design minimalistic and modern website using existing visual language and hand it off for implementation.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#ffffff",
          content:
            "This website was designed in Figma.",
        },
        {
          type: "section",
          title: "Outcome",
          // bgColor: "#fafafa",
          content:
            "The website successfully captures U Bar's unique character and has become an integral part of the venue's brand identity. It provides just enough information to entice visitors while maintaining the air of mystery that makes the speakeasy special.",
        },
      ],
    },
  },
  {
    slug: "kashtan",
    bgColor: "#E9F4E8",
    title: "Kashtan in Berlin",
    description: "Website for a marketplace of Ukrainian products in Berlin.",
    categories: ["web", "development"],
    link: {
      url: "https://kashtaninberlin.de",
      label: "kashtaninberlin.de",
    },
    show: true,
    featured: true,
    caseStudy: {
      client: "Kashtan UG",
      coverImage: "../../projects/kashtan/kashtan--cover.webp",
      task: "Build e-commerce platform for Ukrainian products marketplace",
      releaseDate: "2024",
      role: "Designer & Developer",
      link: {
        url: "https://kashtaninberlin.de",
        label: "kashtaninberlin.de",
      },
      colors: {
        primary: "#286E22",
        contrast: "#643D44",
        faded: "#F1F5F0",
      },
      fonts: {
        title: "Young Serif",
        text: "Work Sans",
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/kashtan/kashtan.webm",
          caption: "Kashtan cover video",
        },
        {
          type: "section",
          title: "Overview",
          content:
            "Kashtan is a pop-up space in the most famous market in Berlin — Markthalle IX — highlighting Ukrainian businesses, handcrafts, and initiatives. We bring the rich culture of Ukrainian food, drinks, and creativity to Berlin.",
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Designer, developer, photographer, barista and bartender.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#F5FAF4",
          content:
            "Successfully launched a minimal website, designeds business cards and flyers for catering.",
        },
        {
          type: "image",
          url: "../../projects/kashtan/kashtan-bc.jpg",
          caption: "Kashtan business cards",
        },
      ],
    },
  },
  {
    slug: "truth-to-justice",
    bgColor: "#e5edff",
    title: "Truth to Justice",
    description: "Development and support of the website for conference.",
    categories: ["web", "development"],
    link: {
      url: "https://truth-to-justice.org",
      label: "truth-to-justice.org",
    },
    show: true,
    featured: true,
    caseStudy: {
      coverImage: "../../projects/truth-to-justice/gallery/01.jpg",
      client: "Vitsche",
      task: "Develop and maintain conference website platform",
      releaseDate: "2024",
      role: "Web Developer",
      link: {
        url: "https://truth-to-justice.org",
        label: "truth-to-justice.org",
      },
      colors: {
        primary: "#0046DD",
        contrast: "#16171B",
        faded: "#E4E4E4",
      },
      fonts: {
        title: "Krona One",
        text: "Helvetica Neue",
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/truth-to-justice/ttj.webm",
          caption: "Truth to Justice cover video",
        },
        {
          type: "section",
          title: "Overview",
          content:
            "Truth to Justice conference was organized by Vitsche, in collaboration with the Kyiv School of Economics, Center for Cultural Projects Arta Azi, and with the Ukrainian Institute in Germany supporting the conference program, funded by the German Foreign Office.",
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Lead developer responsible for implementation, ongoing maintenance, content updates, technical support, and feature enhancements based on organizer feedback.",
        },
        {
          type: "section",
          title: "Technology Stack",
          // bgColor: "#fafafa",
          content:
            "Vue.js",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Implemented provided design into a flexible, well-structured website with clear information architecture to organize speakers, sessions, and resources.",
        },
        {
          type: "gallery",
          images: [
            "../../projects/truth-to-justice/gallery/03.jpg",
            "../../projects/truth-to-justice/gallery/12.jpg",
            "../../projects/truth-to-justice/gallery/14.jpg",
            // "../../projects/truth-to-justice/gallery/17.jpg",
            "../../projects/truth-to-justice/gallery/19.jpg",
          ]
        },
        {
          type: "section",
          title: "Outcome",
          // bgColor: "#fafafa",
          content:
            "Truth to Justice conference brought together 200+ attendees and over 4,000 livestream views.",
        },
        {
          type: "image",
          url: "../../projects/truth-to-justice/gallery/02.jpg",
        }
      ],
    },
  },
  {
    slug: "bus-that-never-arrives",
    bgColor: "#fffff2",
    title: "The Bus That Never Arrives",
    description:
      "Designing and implementing website for the soundscape project about Berlin's bus route №100",
    categories: ["web", "development", "design"],
    link: {
      url: "https://busthatneverarrives.com",
      label: "busthatneverarrives.com",
    },
    show: true,
    featured: true,
    caseStudy: {
      coverImage: "../../projects/busthatneverarrives/bus--cover.webp",
      client: "Vitsche",
      task: "Create immersive digital experience for audio art project",
      releaseDate: "2024",
      titleColor: "contrast",
      role: "Designer & Developer",
      link: {
        url: "https://busthatneverarrives.com",
        label: "busthatneverarrives.com",
      },
      colors: {
        primary: "#ede869",
        contrast: "#222",
        faded: "#fffff2",
      },
      fonts: {
        title: "Permanent Marker",
        text: "Arial",
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/busthatneverarrives/bus.webm",
          caption: "Bus That Never Arrives cover video",
        },
        {
          type: "section",
          title: "Overview",
          content:
            "The Bus That Never Arrives is a soundscape project exploring Berlin's iconic bus route №100. The project required a website that would present the audio work in an engaging and immersive way, while also providing visual context about the project.",
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Design and development of the website from concept to launch in close collaboration with the project's team.",
        },
        {
          type: "section",
          title: "Technology Stack",
          // bgColor: "#fafafa",
          content:
            "The website was designed as a fully standalone, lightweight, and responsive project. Due to the very short delivery timeframe, it was built using HTML, CSS, and JavaScript.",
        },
        {
          type: "section",
          title: "Outcome",
          // bgColor: "#fafafa",
          content:
            "Project was successfully launched and was presented by the whole team at the special event organized by Vitsche.",
        },
        {
          type: "gallery",
          images: [
            "../../projects/busthatneverarrives/gallery/1.webp",
            "../../projects/busthatneverarrives/gallery/2.webp",
            "../../projects/busthatneverarrives/gallery/3.webp",
            "../../projects/busthatneverarrives/gallery/4.webp",
            "../../projects/busthatneverarrives/gallery/5.webp",
            "../../projects/busthatneverarrives/gallery/6.webp",
          ]
        },
        {
          type: "image",
          url: "../../projects/busthatneverarrives/gallery/kate.webp"
        }
      ],
    },
  },
  {
    slug: "nature-on-the-edge",
    bgColor: "#fff3f8",
    title: "Nature on the Edge",
    description:
      "Implemented responsive design for the project page and integrated it in existing website.",
    categories: ["web", "development"],
    link: {
      url: "https://vitsche.org/ecology",
      label: "vitsche.org/ecology",
    },
    show: true,
    featured: true,
    caseStudy: {
      task: "Integrate new ecology project page into Vitsche.org website",
      releaseDate: "2024",
      role: "Frontend Developer",
      client: "Vitsche",
      link: {
        url: "https://vitsche.org/ecology",
        label: "vitsche.org/ecology",
      },
      colors: {
        primary: "#E91E63",
        contrast: "#1EE963",
        faded: "#FFF9FB",
      },
      fonts: {
        title: "KyivTypeTitling",
        text: "KyivTypeSans",
        customTitleFont: true,
        customTextFont: true,
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/nature-on-the-edge/ecology1.webm",
          caption: "Nature on the Edge cover video",
        },
        {
          type: "section",
          title: "Overview",
          content:
            "Nature on the Edge is an environmental awareness project that needed a dedicated page within the Vitsche.org website. The work involved implementing design that presents ecological information effectively while seamlessly integrating with the existing site architecture.",
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Frontend developer responsible for responsive layout implementation, integration with existing codebase and cross-browser testing.",
        },
        {
          type: "section",
          title: "Technology Stack",
          // bgColor: "#fafafa",
          content:
            "Figma, Wordpress, HTML, CSS, JavaScript.",
        },
        {
          type: "section",
          title: "Outcome",
          // bgColor: "#fafafa",
          content:
            "After a successful integration, the project page was launched and received positive feedback from users. The project's outdoor campaign also gained strong public recognition.",
        },
        {
          type: "gallery",
          images: [
            "../../projects/nature-on-the-edge/gallery/street-1.webp",
            "../../projects/nature-on-the-edge/gallery/street-2.webp",
          ]
        },
        {
          type: "image",
          url: "../../projects/nature-on-the-edge/gallery/street-3.webp",
        }
      ],
    },
  },
  {
    slug: "unlimited-paper",
    bgColor: "#EBEDF0",
    title: "Unlimited Paper",
    description:
      "Created a component library and designed landing pages for electronic price tags producer.",
    categories: ["web", "development", "design"],
    link: {
      url: "https://u-paper.com",
      label: "u-paper.com",
    },
    show: false,
    featured: false,
    caseStudy: {
      client: "Unlimited Paper",
      coverImage: "./projects/up.jpg",
      task: "Build design system and landing pages for ESL technology company",
      releaseDate: "2022-2023",
      role: "UI/UX Designer & Frontend Developer",
      link: {
        url: "https://u-paper.com",
        label: "u-paper.com",
      },
      colors: {
        primary: "#5A6C7D",
        contrast: "#D97C5A",
        faded: "#F7F8F9",
      },
      fonts: {
        title: "Poppins",
        text: "Inter",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "Unlimited Paper is a producer of electronic shelf labels (ESL) and digital price tags. The project involved creating a comprehensive component library to ensure design consistency across their digital properties, along with designing and developing multiple landing pages to showcase their products and solutions.",
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Lead designer and frontend developer responsible for component library architecture, design system documentation, landing page design and implementation, and collaboration with marketing team.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Component library development: 6 weeks. Landing page design: 4 weeks. Implementation and refinement: 5 weeks. Documentation: 2 weeks. Total duration: 17 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          // bgColor: "#fafafa",
          content:
            "React, TypeScript, Styled Components, Storybook for component documentation, Figma for design, modern CSS practices, component-driven development approach.",
        },
        {
          type: "section",
          title: "Challenge",
          // bgColor: "#fafafa",
          content:
            "Creating a scalable design system that could accommodate diverse product types and use cases while maintaining brand consistency. The component library needed to be flexible enough for various landing pages yet structured enough to ensure visual coherence.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Developed a modular component library with clear documentation and usage guidelines. Created reusable, configurable components that could be combined to build different page layouts. Designed landing pages that effectively communicate technical product information in an accessible, visually appealing way.",
        },
        {
          type: "section",
          title: "Outcome",
          // bgColor: "#fafafa",
          content:
            "Delivered a robust component library that streamlined the development process and ensured brand consistency across all digital touchpoints. The landing pages effectively showcase Unlimited Paper's technology solutions with improved user engagement and clearer product communication.",
        },
      ],
    },
  },
  {
    slug: "wundertax",
    bgColor: "#F6FAFA",
    title: "wundertax",
    description:
      "As part of the team I took ownership of unifying design elements and design facelifting. Result of my work was a wundertax Design System, created as a Figma library.",
    categories: ["design"],
    link: {
      url: "https://wundertax.de/onboarding/en/",
      label: "wundertax.de/onboarding",
    },
    link2: {
      url: "https://wundertax.de/en/price/",
      label: "wundertax.de/price",
    },
    show: false,
    featured: true,
    caseStudy: {
      coverImage: "./projects/wundertax.jpg",
      task: "Create unified design system for tax filing platform",
      releaseDate: "2022",
      role: "Senior Product Designer",
      link: {
        url: "https://wundertax.de/onboarding/en/",
        label: "view onboarding",
      },
      colors: {
        primary: "#00B8A9",
        contrast: "#F8B400",
        faded: "#F0FFFE",
      },
      fonts: {
        title: "Raleway",
        text: "Nunito Sans",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "Wundertax is a popular German tax filing platform that needed design consistency across its growing product. The project focused on auditing existing design elements, identifying inconsistencies, and creating a comprehensive design system that would streamline the design process and improve user experience across all touchpoints.",
        },
        {
          type: "section",
          title: "My Role",
          // bgColor: "#fafafa",
          content:
            "Product designer leading design system creation, responsible for design audit, component standardization, Figma library creation, documentation, team training, and design refresh implementation.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Design audit and analysis: 3 weeks. Component inventory and standardization: 4 weeks. Figma library creation: 5 weeks. Documentation and team training: 2 weeks. Design refresh implementation: 6 weeks. Total duration: 20 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          // bgColor: "#fafafa",
          content:
            "Figma for design system creation, component libraries, design tokens, comprehensive documentation, collaboration with development team for implementation.",
        },
        {
          type: "section",
          title: "Challenge",
          // bgColor: "#fafafa",
          content:
            "Unifying disparate design elements that had evolved organically across a complex product while maintaining functionality and user familiarity. The design system needed to be comprehensive yet flexible, allowing for both consistency and innovation.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Conducted thorough design audit to identify inconsistencies and redundancies. Created a modular, scalable design system in Figma with clear component hierarchies, reusable patterns, and comprehensive guidelines. Worked closely with developers to ensure smooth implementation of the new system.",
        },
        {
          type: "section",
          title: "Outcome",
          // bgColor: "#fafafa",
          content:
            "Delivered the wundertax Design System, a complete Figma library that dramatically improved design consistency and efficiency. The system reduced design time for new features by 40%, improved collaboration between designers and developers, and provided a solid foundation for the product's visual refresh and future growth.",
        },
      ],
    },
  },
  {
    slug: "choice",
    bgColor: "#F6FAFA",
    title: "Choice",
    description:
      "Designed and developed QR-based digital menu platform for restaurants and hospitality businesses.",
    categories: ["web", "development", "design"],
    link: {
      url: "https://choiceqr.com/",
      label: "choiceqr.com",
    },
    show: false,
    featured: false,
  },
  {
    slug: "workademy",
    bgColor: "#F6FAFA",
    title: "Workademy",
    description:
      "Designed and developed educational platform connecting students with professional development opportunities.",
    categories: ["web", "development", "design"],
    link: {
      url: "https://theworkademy.com/",
      label: "theworkademy.com",
    },
    show: false,
    featured: false,
  },
  {
    slug: "olegs-handwriting",
    bgColor: "#eee",
    title: "Oleg's Handwriting",
    description: "Handwriting font experiment.",
    categories: ["design", "fonts"],
    show: true,
    featured: false,
    caseStudy: {
      template: "font",
      client: "Personal",
      releaseDate: "2024 v0.1",
      fonts: {
        title: "OmHandwriting",
        text: "OmHandwriting",
        customTitleFont: true,
        customTextFont: true,
      },
      fontFile: "../../projects/fonts/OmHandwriting.woff2",
      downloadLink: "../../projects/fonts/OmHandwriting.woff2", 
      blocks: [
         {
          type: "image",
          url: "../../projects/fonts/om-example.jpg"
         },
         {
          type: "section",
          title: "Overview",
          content: "Om Handwriting is a digital version of my own handwriting, created using Calligraphr. It covers both Latin and Cyrillic scripts, making it suitable for bilingual projects that need a personal touch.",
         }
      ]
    },
  },
  {
    slug: "whispers-in-the-wind",
    bgColor: "#000000",
    description: "",
    title: "Whispers in the Wind",
    synopsis: "While a lonely author wrestles with the suffocating grip of so-called writer’s block, desperately searching for inspiration and meaning in her stalled creative process, she is drawn into a series of unexpected events that disrupt her routine and challenge her assumptions about creativity. She begins to see her own experiences as potential narratives and learning to recognize which stories truly deserve to be told and which are better left behind…",
    categories: ["video"],
    show: true,
    featured: false,
    caseStudy: {
      template: "movie",
      coverImage: "../../projects/whispers-in-the-wind/cover.jpg",
      videoFile: "../../projects/whispers-in-the-wind/whispers-in-the-wind.webm",
      posterImage: "../../projects/whispers-in-the-wind/poster.jpg",
      client: "Personal Project",
      releaseDate: "2023",
      // fonts: {
      //   title: "OmHandwriting",
      //   customTitleFont: true,
      // },
      movieData: {
        duration: "2:10",
        director: "Oleg Mokhniuk",
      },
      starring: [
        "Clara Leeder",
        "Daniel Traub", 
        "Dominique Wolfram"
      ],
      laurels: [
        {
          quote: "Very funny!",
          source: "Mariia P." 
        },
        {
          quote: "The only bad thing it was not shot on film.",
          source: "Anton P."
        },
        {
          quote: "I laughed",
          source: "Alex DePew"
        }
      ],
      credits: [
        { role: "Director", name: "Oleg Mokhniuk" },
        { role: "Mentor", name: "Alex DePew" },
        { role: "Music", name: "Masor by Asi C" }
      ]
    },
  },
];
