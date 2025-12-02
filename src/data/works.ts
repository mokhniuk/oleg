type CaseStudy = {
  // Header information (short overview)
  task?: string;
  releaseDate?: string;
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
};

type WorksType = {
  title: string;
  slug: string;
  imageUrl?: string;
  bgColor: string;
  description: string;
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
    imageUrl: "./projects/bagel-bro.jpg",
    bgColor: "#feeadd",
    title: "Bagel Bro",
    description: "Designed and developed website for bagel place in Berlin.",
    link: {
      url: "https://bagelbro.de",
      label: "bagelbro.de",
    },
    show: true,
    featured: true,
  },
  {
    slug: "u-bar-berlin",
    imageUrl: "./projects/u-bar.jpg",
    bgColor: "#ffffd1",
    title: "U Bar Berlin",
    description: "Designed website for amazing speakeasy bar in Berlin.",
    link: {
      url: "https://ubar.me",
      label: "ubar.me",
    },
    show: true,
    featured: true,
  },
  {
    slug: "kashtan-in-berlin",
    imageUrl: "./projects/kashtan.jpg",
    bgColor: "#E9F4E8",
    title: "Kashtan in Berlin",
    description: "Website for a marketplace of Ukrainian products in Berlin.",
    link: {
      url: "https://kashtaninberlin.de",
      label: "kashtaninberlin.de",
    },
    show: true,
    featured: true,
  },
  {
    slug: "truth-to-justice",
    // imageUrl: "./projects/vitsche/t2j.jpg",
    bgColor: "#e5edff",
    title: "Truth to Justice",
    description: "Development and support of the website for conference.",
    link: {
      url: "https://truth-to-justice.org",
      label: "truth-to-justice.org",
    },
    show: true,
    featured: true,
  },
  {
    slug: "bus-that-never-arrives",
    // imageUrl: "./projects/vitsche/100.jpg",
    bgColor: "#fffff2",
    title: "The Bus That Never Arrives",
    description:
      "Designing and implementing website for the soundscape project about Berlin's bus route #100",
    link: {
      url: "https://busthatneverarrives.com",
      label: "busthatneverarrives.com",
    },
    show: true,
    featured: true,
  },
  {
    slug: "nature-on-the-edge",
    imageUrl: "./projects/ecology.webp",
    bgColor: "#fff3f8",
    title: "Nature on the Edge",
    description:
      "Implemented responsive layout for the project page and integrated it in existing website.",
    link: {
      url: "https://vitsche.org/ecology",
      label: "vitsche.org/ecology",
    },
    show: true,
    featured: true,
  },
  {
    slug: "unlimited-paper",
    imageUrl: "./projects/up.jpg",
    bgColor: "#EBEDF0",
    title: "Unlimited Paper",
    description:
      "Created a component library and designed landing pages for electronic price tags producer.",
    link: {
      url: "https://u-paper.com",
      label: "u-paper.com",
    },
    show: false,
    featured: true,
  },
  {
    slug: "wundertax",
    imageUrl: "./projects/wundertax.jpg",
    bgColor: "#F6FAFA",
    title: "wundertax",
    description:
      "As part of the team I took ownership of unifying design elements and design facelifting. Result of my work was a wundertax Design System, created as a Figma library.",
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
  },
  {
    slug: "comprehensive-case-study-test",
    imageUrl: "./projects/test-case-study.jpg",
    bgColor: "#FF6B6B",
    title: "Comprehensive Test Case Study",
    description:
      "A comprehensive case study designed to test layout behavior with extensive content and complex case study sections.",
    link: {
      url: "https://very-long-domain-name-for-testing-layout-behavior.com/projects/comprehensive-case-study",
      label: "very-long-domain-name-for-testing-layout-behavior.com",
    },
    link2: {
      url: "https://secondary-extremely-long-url-for-additional-testing.org/case-studies/detailed-analysis",
      label: "secondary-extremely-long-url-for-additional-testing.org",
    },
    show: true,
    featured: true,
    caseStudy: {
      // Header information (short overview)
      task: "Create revolutionary AI platform",
      releaseDate: "March 2024",
      role: "Design Engineer",
      link: {
        url: "https://very-long-domain-name-for-testing-layout-behavior.com",
        label: "view project",
      },
      // Body sections (detailed content)
      overview:
        "This comprehensive test case study represents a complex, multi-faceted project that spans across various industries and technologies. The project aimed to create a revolutionary platform that combines artificial intelligence, machine learning, blockchain technology, and advanced user experience design to solve critical problems in digital transformation. The scope included developing web applications, mobile apps, desktop software, and IoT integrations while maintaining the highest standards of performance, security, and user accessibility. This project challenged conventional approaches and required innovative solutions across multiple domains including frontend development, backend architecture, database design, cloud infrastructure, DevOps practices, and user experience research.",
      roleDetails:
        "Lead Full-Stack Developer, UI/UX Designer, Product Manager, Technical Architect, DevOps Engineer, Quality Assurance Lead, User Experience Researcher, Data Analyst, Project Coordinator, and Strategic Technology Consultant. Additionally served as the primary liaison between stakeholders, managed cross-functional teams of 15+ developers, designers, and analysts, conducted extensive user research sessions, performed code reviews, established development workflows, implemented CI/CD pipelines, and maintained comprehensive documentation throughout the project lifecycle.",
      timeline:
        "Phase 1: Research and Discovery (3 months) - Conducted extensive market analysis, user interviews, competitive research, and technical feasibility studies. Phase 2: Design and Planning (2 months) - Created comprehensive wireframes, prototypes, design systems, technical specifications, and project roadmaps. Phase 3: Development Sprint 1 (4 months) - Built core platform features, implemented user authentication, developed API endpoints, and established database architecture. Phase 4: Development Sprint 2 (4 months) - Added advanced features, integrated third-party services, implemented real-time functionality, and optimized performance. Phase 5: Testing and Refinement (2 months) - Conducted thorough testing, user acceptance testing, performance optimization, and security audits. Phase 6: Deployment and Launch (1 month) - Deployed to production, monitored performance, gathered user feedback, and implemented immediate improvements. Total project duration: 16 months with ongoing maintenance and feature enhancements.",
      stack:
        "React.js, Next.js, TypeScript, Node.js, Express, MongoDB, PostgreSQL, Redis, AWS, Docker, Kubernetes, GraphQL, REST APIs, WebSockets, Three.js, WebGL, D3.js, Chart.js, Framer Motion, GSAP, Tailwind CSS, SCSS, Jest, Cypress, Storybook, Figma, Adobe Creative Suite, Sketch, InVision, Principle, After Effects. Built for web, iOS, Android, desktop applications, smart TVs, wearable devices, IoT platforms, and emerging AR/VR technologies with cross-platform compatibility and responsive design patterns.",
      challenge:
        "The project faced numerous complex challenges that required innovative solutions and strategic thinking. Technical challenges included integrating multiple legacy systems with modern technologies, handling massive data volumes with real-time processing requirements, ensuring cross-platform compatibility across diverse devices and browsers, implementing robust security measures to protect sensitive user data, and maintaining optimal performance under high traffic loads. Business challenges encompassed tight deadlines with changing requirements, limited budget constraints, coordinating remote teams across different time zones, managing stakeholder expectations with conflicting priorities, and adapting to rapidly evolving market conditions. User experience challenges involved designing intuitive interfaces for complex workflows, ensuring accessibility compliance across all platforms, conducting extensive user testing with diverse demographics, and balancing advanced functionality with simplicity and ease of use.",
      solution:
        "Developed a comprehensive solution architecture that leveraged cutting-edge technologies and best practices. Implemented a microservices architecture using Docker containers and Kubernetes orchestration for scalability and maintainability. Created a robust API layer with GraphQL and REST endpoints to handle complex data relationships and real-time updates. Built responsive user interfaces using React.js with TypeScript, ensuring type safety and developer productivity. Implemented advanced state management with Redux Toolkit and Context API for efficient data flow. Integrated machine learning algorithms for predictive analytics and personalized user experiences. Established comprehensive testing strategies including unit tests, integration tests, end-to-end tests, and automated performance testing. Implemented continuous integration and deployment pipelines using GitHub Actions and AWS services. Created detailed documentation, style guides, and component libraries to ensure consistency and maintainability. Conducted extensive user research and usability testing to validate design decisions and improve user satisfaction.",
      outcome:
        "The project achieved exceptional results exceeding all initial goals and expectations. Delivered a high-performance platform that serves over 100,000 active users with 99.9% uptime and sub-second response times. Increased user engagement by 350% compared to the previous solution, with user satisfaction scores consistently above 4.8/5. Generated significant revenue growth of 280% within the first year of launch, establishing the platform as a market leader in its category. The solution successfully processed over 10 million transactions monthly while maintaining robust security standards with zero major security incidents. Performance metrics showed 60% faster load times compared to competitors, 85% reduction in user-reported issues, and 95% improvement in conversion rates. The project received industry recognition including multiple design awards, technical innovation awards, and was featured in leading technology publications. The scalable architecture successfully supported a 500% increase in user base without performance degradation, demonstrating the effectiveness of the technical decisions and implementation strategies.",
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
      testimonial: {
        quote:
          "This project exceeded every expectation we had. The team delivered an exceptional solution that not only solved our immediate challenges but also positioned us for future growth. The attention to detail, technical excellence, and user-focused approach resulted in a platform that our customers absolutely love. The performance improvements and user experience enhancements have been transformational for our business. We've seen unprecedented engagement levels and our conversion rates have skyrocketed. The collaborative approach and clear communication throughout the project made this one of the most successful partnerships we've ever had. I would highly recommend this team for any complex technical project.",
        author: "Dr. Alexandra Richardson-Montenegro",
        position:
          "Chief Technology Officer and VP of Digital Innovation at Global Technology Solutions Inc.",
      },
    },
  },
  {
    slug: "choice",
    imageUrl: "./projects/choice.jpg",
    bgColor: "#F6FAFA",
    title: "Choice",
    description: "",
    link: {
      url: "https://choiceqr.com/",
      label: "choiceqr.com",
    },
    show: false,
    featured: false,
  },
  {
    slug: "blackthorn-ai",
    imageUrl: "./projects/blackthorn.jpg",
    bgColor: "#F6FAFA",
    title: "Blackthorn AI",
    description: "",
    link: {
      url: "https://blackthorn.ai/",
      label: "blackthorn.ai",
    },
    show: false,
    featured: false,
  },
  {
    slug: "workademy",
    imageUrl: "./projects/workademy.jpg",
    bgColor: "#F6FAFA",
    title: "Workademy",
    description: "",
    link: {
      url: "https://theworkademy.com/",
      label: "theworkademy.com",
    },
    show: false,
    featured: false,
  },
];
