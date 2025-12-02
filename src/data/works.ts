export type SectionBlock = {
  type: "section";
  title?: string;
  content: string;
  image?: string;
  bgColor?: string;
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

export type CaseStudyBlock =
  | SectionBlock
  | ImageBlock
  | VideoBlock
  | GalleryBlock
  | TestimonialBlock;

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
  // Header information (short overview)
  task?: string;
  releaseDate?: string;
  coverImage?: string;
  role?: string;
  link?: {
    url: string;
    label: string;
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
  blocks?: CaseStudyBlock[];
};

type WorksType = {
  title: string;
  slug: string;
  bgColor: string;
  description: string;
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
};

export const WORKS: WorksType[] = [
  {
    slug: "bagel-bro",
    bgColor: "#feeadd",
    title: "Bagel Bro",
    description: "Designed and developed website for bagel place in Berlin.",
    categories: ["web", "development", "design", "photography"],
    link: {
      url: "https://bagelbro.de",
      label: "bagelbro.de",
    },
    show: true,
    featured: true,
    caseStudy: {
      coverImage: "../../projects/bagel-bro/bagelbro--cover.jpg",
      task: "Create modern, appetizing website for Berlin bagel shop",
      releaseDate: "2025",
      role: "Designer & Developer",
      link: {
        url: "https://bagelbro.de",
        label: "bagelbro.de",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "Bagel Bro needed a fresh, inviting online presence that would capture the essence of their artisanal bagel shop in Berlin. The goal was to create a website that showcases their products beautifully while making it easy for customers to find location information, view the menu, and understand what makes Bagel Bro special in Berlin's competitive food scene.",
        },
        {
          type: "image",
          url: "../../projects/bagel-bro/bagelbro--cover2.webp",
          caption: "Bagel Bro cover image",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "Full-stack designer and developer responsible for visual design, brand identity implementation, responsive web development, photography integration, and launch coordination.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Initial design and prototyping: 2 weeks. Development and refinement: 3 weeks. Testing and launch: 1 week. Total duration: 6 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "React, Next.js, TypeScript, Tailwind CSS, Vercel for hosting, responsive design patterns optimized for mobile ordering.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "The main challenge was creating a mouthwatering visual experience that works seamlessly across devices while maintaining fast load times. The site needed to feel warm and inviting while being practical for customers looking for quick information like location, hours, and menu items.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Developed a clean, image-focused design that puts the bagels front and center. Implemented optimized image loading, created an easy-to-scan menu layout, and ensured the site loads quickly even on mobile connections. Used warm color palette matching the brand's friendly atmosphere.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
          content:
            "Delivered a beautiful, functional website that increased online visibility and made it easier for customers to discover Bagel Bro. The site successfully communicates the quality and care that goes into each bagel while providing all essential information in an accessible format.",
        },
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
      role: "Web Designer",
      link: {
        url: "https://ubar.me",
        label: "ubar.me",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "U Bar Berlin is a hidden gem speakeasy bar that needed a website reflecting its mysterious, sophisticated atmosphere. The project focused on creating an elegant digital experience that hints at the exclusive nature of the venue while providing essential information for potential guests.",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "Lead designer responsible for visual concept, user interface design, typography selection, color palette development, and design handoff for implementation.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Research and concept development: 1 week. Design iterations: 2 weeks. Final refinement and handoff: 1 week. Total duration: 4 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "Figma for design, modern web technologies for implementation, focus on atmospheric visuals and smooth animations.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "Balancing the speakeasy's secretive, exclusive nature with the need to be discoverable online. The design had to evoke the bar's sophisticated atmosphere while remaining functional and not overly mysterious to the point of being confusing.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Created a design that uses elegant typography, a refined color palette inspired by the venue's interior, and subtle animations to create intrigue. The layout reveals information progressively, mimicking the experience of discovering the bar itself.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
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
      coverImage: "../../projects/kashtan/kashtan--cover.webp",
      task: "Build e-commerce platform for Ukrainian products marketplace",
      releaseDate: "2023",
      role: "Designer & Developer",
      link: {
        url: "https://kashtaninberlin.de",
        label: "kashtaninberlin.de",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "Kashtan in Berlin connects the Ukrainian community in Berlin with authentic products from home. The project involved creating a welcoming, easy-to-use marketplace website that serves both as a shopping platform and a community hub, helping Ukrainians in Berlin access familiar products and stay connected to their culture.",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "End-to-end responsibility including user research, visual design, frontend and backend development, payment integration, and ongoing maintenance and support.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "User research and planning: 2 weeks. Design phase: 3 weeks. Development: 6 weeks. Testing and launch: 2 weeks. Total duration: 13 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "React, Next.js, TypeScript, Tailwind CSS, payment gateway integration, product management system, responsive design for mobile shopping.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "Creating a marketplace that feels both professional and personal, serving a community with specific needs. The site needed to handle product listings, orders, and payments while being accessible to users with varying levels of technical comfort.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Developed an intuitive marketplace with clear navigation, easy product discovery, and straightforward checkout process. Incorporated community feedback throughout development to ensure the platform meets real user needs. Used warm, welcoming design elements that evoke Ukrainian cultural aesthetics.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
          content:
            "Successfully launched a functional marketplace that serves Berlin's Ukrainian community. The platform has facilitated connections between community members and helped people access products that remind them of home, while supporting Ukrainian businesses.",
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
      task: "Develop and maintain conference website platform",
      releaseDate: "2023-2024",
      role: "Web Developer",
      link: {
        url: "https://truth-to-justice.org",
        label: "visit site",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "Truth to Justice is an important conference focused on accountability and justice. The project involved developing a comprehensive website to support conference organization, provide information to attendees, showcase speakers and sessions, and serve as an ongoing resource for the justice community.",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "Lead developer responsible for implementation, ongoing maintenance, content updates, technical support, and feature enhancements based on organizer feedback.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Initial development: 5 weeks. Pre-conference updates: 3 weeks. Ongoing support and maintenance: continuous. Multiple conference cycles supported.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "Modern web framework, CMS integration for easy content management, responsive design, accessibility features, multilingual support capabilities.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "Building a site that serves multiple purposes: informing potential attendees, managing registrations, presenting complex information clearly, and remaining useful beyond the conference dates. The site needed to be easily updatable by non-technical team members.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Created a flexible, well-structured website with an intuitive content management system. Implemented clear information architecture to organize speakers, sessions, and resources. Provided training and documentation for the team to manage content independently.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
          content:
            "Delivered a reliable platform that has successfully supported multiple conference cycles. The site effectively communicates the conference's mission and practical details while being maintainable by the organizing team without constant developer intervention.",
        },
      ],
    },
  },
  {
    slug: "bus-that-never-arrives",
    bgColor: "#fffff2",
    title: "The Bus That Never Arrives",
    description:
      "Designing and implementing website for the soundscape project about Berlin's bus route #100",
    categories: ["web", "development", "design"],
    link: {
      url: "https://busthatneverarrives.com",
      label: "busthatneverarrives.com",
    },
    show: true,
    featured: true,
    caseStudy: {
      task: "Create immersive digital experience for audio art project",
      releaseDate: "2024",
      role: "Designer & Developer",
      link: {
        url: "https://busthatneverarrives.com",
        label: "visit site",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "The Bus That Never Arrives is an innovative soundscape project exploring Berlin's iconic bus route #100. The project required a website that would serve as both an artistic statement and a functional platform for experiencing the audio work, capturing the essence of urban transit and the stories along the route.",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "Creative director, designer, and developer handling all aspects from concept to launch, including audio integration, interactive elements, and visual storytelling.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Concept development and design: 4 weeks. Development and audio integration: 5 weeks. Testing and refinement: 2 weeks. Total duration: 11 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "React, Next.js, Web Audio API, custom audio player implementation, responsive design, animation libraries for interactive elements.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "Creating an engaging digital experience that complements rather than overshadows the audio content. The site needed to guide users through the soundscape while providing context about the route and project without overwhelming the primary experience.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Designed a minimalist, journey-focused interface that allows the audio to take center stage. Implemented an intuitive audio player with visual feedback, created contextual information displays that enhance understanding without distraction, and ensured smooth performance across devices.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
          content:
            "Launched an immersive digital experience that successfully presents the soundscape project to online audiences. The website has become an integral part of the artwork itself, allowing people worldwide to experience Berlin's bus route #100 through sound.",
        },
      ],
    },
  },
  {
    slug: "nature-on-the-edge",
    bgColor: "#fff3f8",
    title: "Nature on the Edge",
    description:
      "Implemented responsive layout for the project page and integrated it in existing website.",
    categories: ["web", "development"],
    link: {
      url: "https://vitsche.org/ecology",
      label: "vitsche.org/ecology",
    },
    show: true,
    featured: true,
    caseStudy: {
      // coverImage: "./projects/ecology.webp",
      task: "Integrate new ecology project section into existing website",
      releaseDate: "2023",
      role: "Frontend Developer",
      link: {
        url: "https://vitsche.org/ecology",
        label: "visit project",
      },
      blocks: [
        {
          type: "video",
          url: "../../projects/nature-on-the-edge/nature.webm",
          caption: "Nature on the Edge cover video",
        },
        {
          type: "section",
          title: "Overview",
          content:
            "Nature on the Edge is an environmental awareness project that needed a dedicated section within the Vitsche.org website. The work involved creating a responsive, visually compelling layout that presents ecological information effectively while seamlessly integrating with the existing site architecture.",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "Frontend developer responsible for responsive layout implementation, integration with existing codebase, cross-browser testing, and ensuring consistency with the site's design system.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Analysis and planning: 1 week. Layout development: 2 weeks. Integration and testing: 1 week. Total duration: 4 weeks.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "HTML, CSS, JavaScript, responsive design techniques, integration with existing CMS, mobile-first approach.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "Integrating new content into an established website while maintaining visual consistency and ensuring the new section feels cohesive with the existing design. The layout needed to work flawlessly across all device sizes and present dense ecological information in an accessible way.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Developed a flexible, responsive layout system that adapts content presentation based on screen size. Carefully matched existing design patterns while introducing new elements needed for the ecology content. Thoroughly tested across devices and browsers to ensure consistent experience.",
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
          content:
            "Successfully integrated the Nature on the Edge project into the website with a polished, professional presentation. The responsive layout ensures visitors can engage with the ecological content effectively regardless of their device, supporting the project's educational mission.",
        },
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
    featured: true,
    caseStudy: {
      coverImage: "./projects/up.jpg",
      task: "Build design system and landing pages for ESL technology company",
      releaseDate: "2022-2023",
      role: "UI/UX Designer & Frontend Developer",
      link: {
        url: "https://u-paper.com",
        label: "visit site",
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
          bgColor: "#fafafa",
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
          bgColor: "#fafafa",
          content:
            "React, TypeScript, Styled Components, Storybook for component documentation, Figma for design, modern CSS practices, component-driven development approach.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
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
          bgColor: "#fafafa",
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
          bgColor: "#fafafa",
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
          bgColor: "#fafafa",
          content:
            "Figma for design system creation, component libraries, design tokens, comprehensive documentation, collaboration with development team for implementation.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
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
          bgColor: "#fafafa",
          content:
            "Delivered the wundertax Design System, a complete Figma library that dramatically improved design consistency and efficiency. The system reduced design time for new features by 40%, improved collaboration between designers and developers, and provided a solid foundation for the product's visual refresh and future growth.",
        },
      ],
    },
  },
  {
    slug: "comprehensive-case-study-test",
    bgColor: "#FF6B6B",
    title: "Comprehensive Test Case Study",
    description:
      "A comprehensive case study designed to test layout behavior with extensive content and complex case study sections.",
    categories: ["web", "development", "design"],
    link: {
      url: "https://very-long-domain-name-for-testing-layout-behavior.com/projects/comprehensive-case-study",
      label: "very-long-domain-name-for-testing-layout-behavior.com",
    },
    link2: {
      url: "https://secondary-extremely-long-url-for-additional-testing.org/case-studies/detailed-analysis",
      label: "secondary-extremely-long-url-for-additional-testing.org",
    },
    show: false,
    featured: false,
    caseStudy: {
      coverImage: "./projects/test-case-study.jpg",
      task: "Create revolutionary AI platform",
      releaseDate: "March 2024",
      role: "Design Engineer",
      link: {
        url: "https://very-long-domain-name-for-testing-layout-behavior.com",
        label: "view project",
      },
      blocks: [
        {
          type: "section",
          title: "Overview",
          content:
            "This comprehensive test case study represents a complex, multi-faceted project that spans across various industries and technologies. The project aimed to create a revolutionary platform that combines artificial intelligence, machine learning, blockchain technology, and advanced user experience design to solve critical problems in digital transformation. The scope included developing web applications, mobile apps, desktop software, and IoT integrations while maintaining the highest standards of performance, security, and user accessibility. This project challenged conventional approaches and required innovative solutions across multiple domains including frontend development, backend architecture, database design, cloud infrastructure, DevOps practices, and user experience research.",
        },
        {
          type: "section",
          title: "My Role",
          bgColor: "#fafafa",
          content:
            "Lead Full-Stack Developer, UI/UX Designer, Product Manager, Technical Architect, DevOps Engineer, Quality Assurance Lead, User Experience Researcher, Data Analyst, Project Coordinator, and Strategic Technology Consultant. Additionally served as the primary liaison between stakeholders, managed cross-functional teams of 15+ developers, designers, and analysts, conducted extensive user research sessions, performed code reviews, established development workflows, implemented CI/CD pipelines, and maintained comprehensive documentation throughout the project lifecycle.",
        },
        {
          type: "section",
          title: "Timeline",
          content:
            "Phase 1: Research and Discovery (3 months) - Conducted extensive market analysis, user interviews, competitive research, and technical feasibility studies. Phase 2: Design and Planning (2 months) - Created comprehensive wireframes, prototypes, design systems, technical specifications, and project roadmaps. Phase 3: Development Sprint 1 (4 months) - Built core platform features, implemented user authentication, developed API endpoints, and established database architecture. Phase 4: Development Sprint 2 (4 months) - Added advanced features, integrated third-party services, implemented real-time functionality, and optimized performance. Phase 5: Testing and Refinement (2 months) - Conducted thorough testing, user acceptance testing, performance optimization, and security audits. Phase 6: Deployment and Launch (1 month) - Deployed to production, monitored performance, gathered user feedback, and implemented immediate improvements. Total project duration: 16 months with ongoing maintenance and feature enhancements.",
        },
        {
          type: "section",
          title: "Technology Stack",
          bgColor: "#fafafa",
          content:
            "React.js, Next.js, TypeScript, Node.js, Express, MongoDB, PostgreSQL, Redis, AWS, Docker, Kubernetes, GraphQL, REST APIs, WebSockets, Three.js, WebGL, D3.js, Chart.js, Framer Motion, GSAP, Tailwind CSS, SCSS, Jest, Cypress, Storybook, Figma, Adobe Creative Suite, Sketch, InVision, Principle, After Effects. Built for web, iOS, Android, desktop applications, smart TVs, wearable devices, IoT platforms, and emerging AR/VR technologies with cross-platform compatibility and responsive design patterns.",
        },
        {
          type: "section",
          title: "Challenge",
          bgColor: "#fafafa",
          content:
            "The project faced numerous complex challenges that required innovative solutions and strategic thinking. Technical challenges included integrating multiple legacy systems with modern technologies, handling massive data volumes with real-time processing requirements, ensuring cross-platform compatibility across diverse devices and browsers, implementing robust security measures to protect sensitive user data, and maintaining optimal performance under high traffic loads. Business challenges encompassed tight deadlines with changing requirements, limited budget constraints, coordinating remote teams across different time zones, managing stakeholder expectations with conflicting priorities, and adapting to rapidly evolving market conditions. User experience challenges involved designing intuitive interfaces for complex workflows, ensuring accessibility compliance across all platforms, conducting extensive user testing with diverse demographics, and balancing advanced functionality with simplicity and ease of use.",
        },
        {
          type: "section",
          title: "Solution",
          content:
            "Developed a comprehensive solution architecture that leveraged cutting-edge technologies and best practices. Implemented a microservices architecture using Docker containers and Kubernetes orchestration for scalability and maintainability. Created a robust API layer with GraphQL and REST endpoints to handle complex data relationships and real-time updates. Built responsive user interfaces using React.js with TypeScript, ensuring type safety and developer productivity. Implemented advanced state management with Redux Toolkit and Context API for efficient data flow. Integrated machine learning algorithms for predictive analytics and personalized user experiences. Established comprehensive testing strategies including unit tests, integration tests, end-to-end tests, and automated performance testing. Implemented continuous integration and deployment pipelines using GitHub Actions and AWS services. Created detailed documentation, style guides, and component libraries to ensure consistency and maintainability. Conducted extensive user research and usability testing to validate design decisions and improve user satisfaction.",
        },
        {
          type: "gallery",
          images: [
            "./projects/test-case-study/wireframes-and-prototypes.jpg",
            "./projects/test-case-study/user-interface-desktop.jpg",
            "./projects/test-case-study/mobile-responsive-design.jpg",
            "./projects/test-case-study/dashboard-analytics.jpg",
            "./projects/test-case-study/user-journey-mapping.jpg",
            "./projects/test-case-study/technical-architecture.jpg",
            "./projects/test-case-study/performance-metrics.jpg",
            "./projects/test-case-study/user-testing-sessions.jpg",
            "./projects/test-case-study/design-system-components.jpg",
            "./projects/test-case-study/final-product-showcase.jpg",
          ],
        },
        {
          type: "section",
          title: "Outcome",
          bgColor: "#fafafa",
          content:
            "The project achieved exceptional results exceeding all initial goals and expectations. Delivered a high-performance platform that serves over 100,000 active users with 99.9% uptime and sub-second response times. Increased user engagement by 350% compared to the previous solution, with user satisfaction scores consistently above 4.8/5. Generated significant revenue growth of 280% within the first year of launch, establishing the platform as a market leader in its category. The solution successfully processed over 10 million transactions monthly while maintaining robust security standards with zero major security incidents. Performance metrics showed 60% faster load times compared to competitors, 85% reduction in user-reported issues, and 95% improvement in conversion rates. The project received industry recognition including multiple design awards, technical innovation awards, and was featured in leading technology publications. The scalable architecture successfully supported a 500% increase in user base without performance degradation, demonstrating the effectiveness of the technical decisions and implementation strategies.",
        },
        {
          type: "testimonial",
          quote:
            "This project exceeded every expectation we had. The team delivered an exceptional solution that not only solved our immediate challenges but also positioned us for future growth. The attention to detail, technical excellence, and user-focused approach resulted in a platform that our customers absolutely love. The performance improvements and user experience enhancements have been transformational for our business. We've seen unprecedented engagement levels and our conversion rates have skyrocketed. The collaborative approach and clear communication throughout the project made this one of the most successful partnerships we've ever had. I would highly recommend this team for any complex technical project.",
          author: "Dr. Alexandra Richardson-Montenegro",
          position:
            "Chief Technology Officer and VP of Digital Innovation at Global Technology Solutions Inc.",
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
];
