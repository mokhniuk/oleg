type WorksType = {
  title: string;
  imageUrl?: string;
  bgColor: string;
  description: string;
  platformsDescription?: string;
  url?: string;
  urlLabel?: string;
  url2?: string;
  urlLabel2?: string;
  stack?: string;
  show: boolean;
  featured?: boolean;
};

export const WORKS: WorksType[] = [
  {
    imageUrl: "./projects/u-bar.jpg",
    bgColor: "#ffffd1",
    title: "U Bar Berlin",
    description: "Designed website for amazing speakeasy bar in Berlin.",
    // platformsDescription: "string",
    stack: "Figma",
    url: "https://ubar.me",
    urlLabel: "ubar.me",
    show: true,
    featured: true,
  },
  {
    imageUrl: "./projects/kashtan.jpg",
    bgColor: "#E9F4E8",
    title: "Kashtan in Berlin",
    description:
      "Website for a marketplace of Ukrainian products in Berlin.",
    // platformsDescription: "Hostinger Website Builder",
    // stack: "Figma",
    url: "https://kashtaninberlin.de",
    urlLabel: "kashtaninberlin.de",
    show: true,
    featured: true,
  },
  {
    // imageUrl: "./projects/vitsche/t2j.jpg",
    bgColor: "#e5edff",
    title: "Truth to Justice",
    description: "Development and support of the website for conference.",
    // platformsDescription: "string",
    stack: "Vue.js, CSS, Figma",
    url: "https://truth-to-justice.org",
    urlLabel: "truth-to-justice.org",
    show: true,
    featured: true,
  },
  {
    // imageUrl: "./projects/vitsche/100.jpg",
    bgColor: "#fffff2",
    title: "The Bus That Never Arrives",
    description:
      "Designing and implementing website for the soundscape project about Berlin's bus route #100",
    // platformsDescription: "string",
    stack: "HTML, CSS, JS, Figma",
    url: "https://busthatneverarrives.com",
    urlLabel: "busthatneverarrives.com",
    show: true,
    featured: true,
  },
  {
    imageUrl: "./projects/ecology.webp",
    bgColor: "#fff3f8",
    title: "Nature on the Edge",
    description:
      "Implemented responsive layout for the project page and integrated it in existing website.",
    // platformsDescription: "string",
    stack: "WordPress, HTML, CSS, JS, Figma",
    url: "https://vitsche.org/ecology",
    urlLabel: "vitsche.org/ecology",
    show: true,
    featured: true,
  },
  // {
  //   imageUrl: "./projects/pandora-cards.jpg",
  //   bgColor: "",
  //   title: "Pandora Cards",
  //   description: "Frontend development of web application.",
  //   // platformsDescription: "string",
  //   stack: "Next.js, TypeScript, CSS-modules, Figma",
  //   // url: "Url",
  //   // urlLabel: "string",
  // },
  {
    imageUrl: "./projects/up.jpg",
    bgColor: "#EBEDF0",
    title: "Unlimited Paper",
    description:
      "Created a component library and designed landing pages for electronic price tags producer.",
    platformsDescription: "Designed mobile app for iOS and Android.",
    stack: "Figma, Webflow",
    url: "https://u-paper.com",
    urlLabel: "u-paper.com",
    show: true,
    featured: true,
  },
  {
    imageUrl: "./projects/wundertax.jpg",
    bgColor: "#F6FAFA",
    title: "wundertax",
    description:
      "As part of the team I took ownership of unifying design elements and design facelifting. Result of my work was a wundertax Design System, created as a Figma library.",
    platformsDescription:
      " Usage of the design system was kickstarted with building new pricing page for the website and onboarding flow, using new components.",
    stack: "Figma, React.js, TypeScript, Storybook, Wordpress, Hugo",
    url: "https://wundertax.de/onboarding/en/",
    urlLabel: "wundertax.de/onboarding",
    url2: "https://wundertax.de/en/price/",
    urlLabel2: "wundertax.de/price",
    show: true,
    featured: false,
  },
  {
    imageUrl: "./projects/choice.jpg",
    bgColor: "#F6FAFA",
    title: "Choice",
    description: "",
    platformsDescription: "",
    stack: "Figma, Wordpress, HTML, CSS, JS",
    url: "https://choiceqr.com/",
    urlLabel: "choiceqr.com",
    show: false,
    featured: false,
  },
  {
    imageUrl: "./projects/blackthorn.jpg",
    bgColor: "#F6FAFA",
    title: "Blackthorn AI",
    description: "",
    platformsDescription: "",
    stack: "Figma, Wordpress, HTML, CSS, JS",
    url: "https://blackthorn.ai/",
    urlLabel: "blackthorn.ai",
    show: false,
    featured: false,
  },
  {
    imageUrl: "./projects/workademy.jpg",
    bgColor: "#F6FAFA",
    title: "Workademy",
    description: "",
    platformsDescription: "",
    stack: "Vue",
    url: "https://theworkademy.com/",
    urlLabel: "theworkademy.com",
    show: false,
    featured: false,
  },
];
