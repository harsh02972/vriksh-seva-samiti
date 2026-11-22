export interface NavItem {
  href: string;
  labelEn: string;
  /** Marathi label used in the footer link lists. */
  labelMr: string;
}

export const mainNav: NavItem[] = [
  { href: "/", labelEn: "Home", labelMr: "मुख्यपृष्ठ" },
  { href: "/about", labelEn: "About Us", labelMr: "आमच्याबद्दल" },
  { href: "/how-it-works", labelEn: "How It Works", labelMr: "कसे काम करतो" },
  { href: "/our-work", labelEn: "Our Work", labelMr: "आमचे काम" },
  { href: "/gallery", labelEn: "Gallery", labelMr: "फोटो गॅलरी" },
  { href: "/leaderboard", labelEn: "Leaderboard", labelMr: "लीडरबोर्ड" },
  { href: "/contact", labelEn: "Contact", labelMr: "संपर्क" },
];

export const getInvolved: NavItem = { href: "/get-involved", labelEn: "Get Involved", labelMr: "रद्दी दान करा" };
export const privacy: NavItem = { href: "/privacy", labelEn: "Privacy", labelMr: "गोपनीयता धोरण" };
