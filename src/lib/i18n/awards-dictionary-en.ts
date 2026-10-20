import type { AwardsMessages } from "./awards-dictionary";

// EN copy is a dev draft pending PM review.
export const awardsMessagesEn: AwardsMessages = {
  meta: { title: "SAA 2025 Award System" },
  hero: {
    caption: "Sun* Annual Awards 2025",
    heading: "SAA 2025 Award System",
    keyvisualAlt: "Sun* Annual Award 2025 keyvisual",
    logoAlt: "Root Further",
  },
  nav: {
    ariaLabel: "Award system",
    labels: {
      "top-talent": "Top Talent",
      "top-project": "Top Project",
      "top-project-leader": "Top Project\nLeader",
      "best-manager": "Best Manager",
      "signature-2025-creator": "Signature 2025 \nCreator",
      mvp: "MVP",
    },
  },
  card: { quantityLabel: "Number of awards:", valueLabel: "Award value:", orLabel: "Or" },
  details: {
    "top-talent": {
      description: [
        "The Top Talent award honors well-rounded outstanding individuals – people who consistently demonstrate solid professional expertise and exceptional performance, always deliver value beyond expectations, and are highly regarded by clients and teammates. Ready to take on any task the organization entrusts to them, they are a constant source of inspiration, drive motivation, and positively influence the whole team.",
      ],
      quantity: "10",
      quantityUnit: "Individuals",
      values: [{ amount: "7,000,000 VND", note: "per award" }],
    },
    "top-project": {
      description: [
        "The Top Project award honors outstanding project teams with business results beyond expectations, optimal operational efficiency, and a dedicated working spirit. These are projects with high technical complexity, excellent resource and cost optimization, valuable ideas proposed to clients, outstanding profit, and positive client feedback. Members strictly follow internal development standards, setting a model of excellence and professionalism.",
      ],
      quantity: "02",
      quantityUnit: "Teams",
      values: [{ amount: "15,000,000 VND", note: "per award" }],
    },
    "top-project-leader": {
      description: [
        "The Top Project Leader award honors outstanding project managers – people who combine solid management skills, powerful ability to inspire, and an “Aim High – Be Agile” mindset in every problem and context. Under their guidance, members not only overcome challenges and reach their goals together, but also keep their passion and Wasshoi spirit alive, and grow into the best – and happier – version of themselves.",
      ],
      quantity: "03",
      quantityUnit: "Individuals",
      values: [{ amount: "7,000,000 VND", note: "per award" }],
    },
    "best-manager": {
      description: [
        "The Best Manager award honors exemplary leaders – those who guided their teams to results beyond expectations, with a standout impact on business performance and the sustainable growth of the organization. Under their leadership, the team conquers and masters every goal through multitasking ability, effective collaboration, and a flexible approach to technology in the digital era. They inspire the team to be confident and full of energy, ready to embrace – and even lead – revolutionary change.",
      ],
      quantity: "01",
      quantityUnit: "Individual",
      values: [{ amount: "10,000,000 VND" }],
    },
    "signature-2025-creator": {
      description: [
        "The Signature award honors an individual or team who embodies the distinctive spirit Sun* strives for in each period.",
        "In 2025, the Signature award honors the Creator – an individual/team with a proactive and perceptive mindset, who always sees opportunity in challenge and leads through action. They quickly identify problems and offer practical solutions that bring clear value to projects, clients, or the organization. With the constructive mindset and “Creator” spirit unique to Sun*, they not only respond positively to change but proactively drive improvement, helping shape a new standard for how Sun* people create value.",
      ],
      quantity: "01",
      quantityUnit: "Individual or team",
      values: [
        { amount: "5,000,000 VND", note: "for an individual award" },
        { amount: "8,000,000 VND", note: "for a team award" },
      ],
    },
    mvp: {
      description: [
        "The MVP award honors the best individual of the year – the representative face of the entire Sun* community. They have shown outstanding ability, enduring dedication, and far-reaching influence, leaving a strong mark on Sun*'s journey throughout the year.",
        "Beyond outstanding performance and results, they are a source of inspiration that spreads – through their thinking, actions, and positive influence on the team. The MVP embodies all the qualities of an exemplary Sun* person and carries a great responsibility: to be a role model for Sun* people and spirit, helping lead the team to new heights.",
      ],
      quantity: "01",
      quantityUnit: "Individual",
      values: [{ amount: "15,000,000 VND" }],
    },
  },
};
