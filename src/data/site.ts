/**
 * BUILT-IN FALLBACK CONTENT (the Phase 1 placeholders).
 *
 * Since Phase 2 the real content comes from Supabase (see src/lib/content.ts).
 * This file is used only when the database is not configured, cannot be reached,
 * or has no rows yet for a section — so the website never breaks or goes blank.
 * Page texts have their defaults in src/lib/page-text.ts.
 *
 * Rules:
 * - `isSample: true` / `isPlaceholder: true` marks anything that is NOT real yet.
 *   The UI shows a small yellow "नमुना" (sample) note wherever such data appears.
 * - Never add money amounts. The public site shows trees, kg and people only.
 * - Dates are ISO strings (YYYY-MM-DD). Numbers are plain numbers; the UI
 *   formats them with Marathi digits.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ContributorType = "school" | "college" | "individual" | "organisation";

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  /** Marathi alt text describing the photo. */
  alt: string;
  isPlaceholder?: boolean;
}

export interface SiteInfo {
  nameEn: string;
  nameMr: string;
  placeMr: string;
  mottoMr: string;
  taglineEn: string;
  descriptionMr: string;
  /** Used for metadata, sitemap and share links. */
  siteUrl: string;
  copyrightYear: number;
}

export interface ContactInfo {
  phoneDisplay: string;
  phoneE164: string;
  whatsappE164: string;
  email: string;
  addressMr: string;
  mapUrl: string;
  collectionHoursMr: string;
  whatsappGroupUrl?: string;
  socials?: { facebook?: string; instagram?: string; youtube?: string };
  isPlaceholder: boolean;
}

/** table: impact_stats (single row, or a view computed from plantings/collections) */
export interface ImpactStats {
  treesPlanted: number;
  treesSurviving: number;
  wasteKg: number;
  donors: number;
  /** Next milestone shown on the hero counter progress bar. */
  nextMilestone: number;
  asOf: string;
  isSample: boolean;
}

/** table: workflow_steps */
export interface WorkflowStep {
  id: string;
  titleEn: string;
  textMr: string;
  icon: "collect" | "weigh" | "sell" | "plant" | "care";
}

/** table: accepted_items */
export interface AcceptedItem {
  id: string;
  labelMr: string;
  noteMr?: string;
  accepted: boolean;
}

/** table: give_methods */
export interface GiveMethod {
  id: string;
  titleEn: string;
  textMr: string;
  icon: "dropoff" | "school" | "pickup";
}

/** table: plantings */
export interface Planting {
  id: string;
  titleMr: string;
  placeMr: string;
  date: string;
  treesPlanted: number;
  treesSurviving: number;
  speciesMr: string[];
  partnerMr?: string;
  careNoteMr: string;
  /** Main photo (the first of `photos`). */
  image: ImageAsset;
  /** All photos, main photo first. */
  photos?: ImageAsset[];
  /** Google Maps link when a map location is set. */
  mapUrl?: string;
  /** Donors who helped (only those visible on the leaderboard). */
  donorNamesMr?: string[];
  isSample: boolean;
}

/** table: gallery_photos */
export type GalleryCategory = "collection" | "planting" | "care" | "schools";
export interface GalleryPhoto {
  id: string;
  category: GalleryCategory;
  captionMr: string;
  placeMr: string;
  date: string;
  image: ImageAsset;
  showOnHome?: boolean;
  isSample: boolean;
}

/** table: leaderboard_entries — ONLY name, type and trees. No money, ever. */
export interface LeaderboardEntry {
  id: string;
  nameMr: string;
  type: ContributorType;
  trees: number;
  /** Optional English spelling so visitors can search in English. Never displayed. */
  searchAlias?: string;
  isSample: boolean;
}

/** table: campaigns (one row marked current) */
export interface Campaign {
  id: string;
  titleEn: string;
  yearLabelMr: string;
  descriptionMr: string;
  startDate: string;
  endDate: string;
  treeTarget: number;
  treesPlanted: number;
  isSample: boolean;
}

/** table: featured_video (single row; admin uploads MP4 ≤ 15 MB in Phase 2) */
export interface FeaturedVideo {
  /** null = no video yet; the section then shows the poster with a "coming soon" note. */
  src: string | null;
  mimeType: "video/mp4";
  poster: ImageAsset;
  titleEn: string;
  captionMr: string;
  /** Plain-text summary of what is said/shown, for visitors who cannot play sound. */
  transcriptMr: string;
  durationSec: number;
  orientation: "landscape" | "portrait";
  /** Allow a silent looping preview on wide screens with a good connection. */
  mutedPreview: boolean;
  isPlaceholder: boolean;
}

/** table: about_values */
export interface ValueCard {
  titleEn: string;
  textMr: string;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export const site: SiteInfo = {
  nameEn: "Vriksh Seva Samiti",
  nameMr: "वृक्ष सेवा समिती",
  placeMr: "सिंदी (मेघे), वर्धा",
  mottoMr: "वृक्षारोपण व संगोपन हेच खरे ध्येय जीवन",
  taglineEn: "Your Scrap Can Grow a Forest",
  descriptionMr:
    "वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा — शाळा, महाविद्यालये आणि नागरिकांकडून रद्दी व भंगार गोळा करून, त्याच्या विक्रीतून वर्धा शहरात झाडे लावते आणि ती मोठी होईपर्यंत त्यांची काळजी घेते.",
  // Set NEXT_PUBLIC_SITE_URL to the real domain (Netlify → Environment variables).
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://vriksh-seva-samiti.netlify.app").replace(/\/$/, ""),
  copyrightYear: 2026,
};

// PLACEHOLDER contact details — replace all of these with the real ones.
export const contact: ContactInfo = {
  phoneDisplay: "+91 00000 00000",
  phoneE164: "+910000000000",
  whatsappE164: "910000000000",
  email: "contact@example.org",
  addressMr: "सिंदी (मेघे), वर्धा, महाराष्ट्र — पूर्ण पत्ता लवकरच",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Sindi+Meghe+Wardha",
  collectionHoursMr: "दर रविवारी, सकाळी ८ ते ११",
  isPlaceholder: true,
};

// SAMPLE numbers (same as the approved demo).
export const impact: ImpactStats = {
  treesPlanted: 1250,
  treesSurviving: 1080,
  wasteKg: 18400,
  donors: 640,
  nextMilestone: 2000,
  asOf: "2026-11-20",
  isSample: true,
};

export const workflow: WorkflowStep[] = [
  {
    id: "collect",
    titleEn: "Collect",
    textMr: "शाळा, महाविद्यालये आणि नागरिकांकडून रद्दी पेपर, पुठ्ठा, जुनी पुस्तके आणि भंगार गोळा करतो.",
    icon: "collect",
  },
  {
    id: "weigh",
    titleEn: "Sort & Weigh",
    textMr: "गोळा केलेली रद्दी वेगवेगळी करून तिचे वजन केले जाते आणि प्रत्येक दात्याची नोंद ठेवली जाते.",
    icon: "weigh",
  },
  {
    id: "sell",
    titleEn: "Sell & Fund",
    textMr: "रद्दी व भंगार विकले जाते. त्यातून मिळणारा प्रत्येक रुपया फक्त झाडे लावण्यासाठी आणि जगवण्यासाठी वापरला जातो.",
    icon: "sell",
  },
  {
    id: "plant",
    titleEn: "Plant",
    textMr: "वर्धा शहरात योग्य ठिकाणी देशी झाडे लावली जातात — शाळा, महाविद्यालये आणि नागरिकांच्या सहभागाने.",
    icon: "plant",
  },
  {
    id: "care",
    titleEn: "Water & Care",
    textMr: "झाड मोठे होईपर्यंत आमची टीम नियमित पाणी घालते, संरक्षक कुंपण लावते आणि निगा राखते.",
    icon: "care",
  },
];

export const acceptedItems: AcceptedItem[] = [
  { id: "newspaper", labelMr: "वर्तमानपत्र / रद्दी पेपर", accepted: true },
  { id: "cardboard", labelMr: "पुठ्ठा व खोकी", accepted: true },
  { id: "books", labelMr: "जुन्या वह्या-पुस्तके", accepted: true },
  { id: "plastic", labelMr: "प्लास्टिक", noteMr: "स्वच्छ व कोरडे", accepted: true },
  { id: "metal", labelMr: "लोखंड व धातू भंगार", accepted: true },
  // To be confirmed by the Samiti:
  { id: "wet", labelMr: "ओला कचरा / अन्न कचरा", accepted: false },
  { id: "oily", labelMr: "ओली किंवा तेलकट रद्दी", accepted: false },
  { id: "medical", labelMr: "वैद्यकीय कचरा", accepted: false },
];

export const giveMethods: GiveMethod[] = [
  {
    id: "dropoff",
    titleEn: "Drop It Off",
    textMr: "तुमची रद्दी सिंदी (मेघे) येथील आमच्या संकलन केंद्रावर ठरलेल्या वेळेत आणून द्या.",
    icon: "dropoff",
  },
  {
    id: "school",
    titleEn: "School & College Drives",
    textMr: "तुमच्या शाळा किंवा महाविद्यालयात रद्दी संकलन मोहीम घ्या. आमची टीम येऊन रद्दी घेऊन जाईल.",
    icon: "school",
  },
  {
    id: "pickup",
    titleEn: "Home Pickup",
    textMr: "जास्त रद्दी असल्यास फोन किंवा WhatsApp करा. आम्ही घरून उचलण्याची वेळ ठरवू.",
    icon: "pickup",
  },
];

export const values: ValueCard[] = [
  { titleEn: "Plant", textMr: "योग्य ठिकाणी, योग्य झाड" },
  { titleEn: "Protect", textMr: "पाणी, कुंपण आणि निगा" },
  { titleEn: "Prove", textMr: "प्रत्येक झाडाचा फोटो व नोंद" },
];

// SAMPLE campaign text from the approved demo; dates/targets are sample.
export const currentCampaign: Campaign = {
  id: "campaign-year-2",
  titleEn: "Current Campaign",
  yearLabelMr: "वर्ष २ रे",
  descriptionMr: "छत्रपती शिवाजी महाराजांच्या राज्याभिषेक दिन ते शिवजयंती पर्यंत वृक्षारोपण मोहीम.",
  startDate: "2026-06-06",
  endDate: "2027-02-19",
  treeTarget: 1000,
  treesPlanted: 635,
  isSample: true,
};

// PLACEHOLDER video (20 s test clip with a tone). Real MP4 is added later / uploaded by admin in Phase 2.
export const featuredVideo: FeaturedVideo = {
  src: "/media/featured-video-placeholder.mp4",
  mimeType: "video/mp4",
  poster: {
    src: "/images/placeholders/video-poster.jpg",
    width: 1600,
    height: 900,
    alt: "वृक्षारोपण करताना स्वयंसेवक — व्हिडिओचे मुखपृष्ठ (नमुना चित्र)",
    isPlaceholder: true,
  },
  titleEn: "See Our Work in 20 Seconds",
  captionMr: "रद्दी संकलनापासून झाड लावून त्याला पाणी देईपर्यंतचा आमचा प्रवास — थोडक्यात.",
  transcriptMr:
    "नमुना मजकूर: व्हिडिओमध्ये स्वयंसेवक शाळेतून रद्दी गोळा करताना, तिचे वजन करताना, झाडे लावताना आणि त्यांना पाणी देताना दिसतात. खरा व्हिडिओ आल्यावर हा मजकूर बदलला जाईल.",
  durationSec: 20,
  orientation: "landscape",
  mutedPreview: true,
  isPlaceholder: true,
};

const ph = (name: string, alt: string, portrait = false): ImageAsset => ({
  src: `/images/placeholders/${name}.jpg`,
  width: portrait ? 1200 : 1600,
  height: portrait ? 1600 : 1200,
  alt,
  isPlaceholder: true,
});

// SAMPLE plantings with PLACEHOLDER photos.
export const plantings: Planting[] = [
  {
    id: "p-2026-11-14",
    titleMr: "महाविद्यालय परिसरात वृक्षारोपण",
    placeMr: "हरित विज्ञान महाविद्यालय, वर्धा",
    date: "2026-11-14",
    treesPlanted: 90,
    treesSurviving: 88,
    speciesMr: ["पिंपळ", "अर्जुन", "बहावा"],
    partnerMr: "हरित विज्ञान महाविद्यालय",
    careNoteMr: "विद्यार्थ्यांनी प्रत्येकी एक झाड दत्तक घेतले आहे.",
    image: ph("planting-04", "महाविद्यालयाच्या आवारात लावलेली झाडे (नमुना चित्र)"),
    isSample: true,
  },
  {
    id: "p-2026-10-02",
    titleMr: "गांधी जयंती — रस्त्याच्या दुतर्फा झाडे",
    placeMr: "सिंदी (मेघे) – वर्धा मार्ग",
    date: "2026-10-02",
    treesPlanted: 150,
    treesSurviving: 139,
    speciesMr: ["कडुनिंब", "करंज", "बहावा"],
    partnerMr: "युवा मित्र मंडळ, वर्धा",
    careNoteMr: "आठवड्यातून दोनदा टँकरने पाणी दिले जाते.",
    image: ph("planting-03", "रस्त्याच्या कडेला लावलेल्या रोपांना पाणी देताना (नमुना चित्र)"),
    isSample: true,
  },
  {
    id: "p-2026-08-15",
    titleMr: "स्वातंत्र्य दिन — शाळेत वृक्षारोपण",
    placeMr: "आदर्श विद्यालय, सिंदी (मेघे)",
    date: "2026-08-15",
    treesPlanted: 75,
    treesSurviving: 72,
    speciesMr: ["आंबा", "जांभूळ", "करंज"],
    partnerMr: "आदर्श विद्यालय",
    careNoteMr: "शाळेच्या हरित सेनेकडे रोज पाणी देण्याची जबाबदारी.",
    image: ph("planting-02", "शाळेच्या आवारात वृक्षारोपण (नमुना चित्र)"),
    isSample: true,
  },
  {
    id: "p-2026-07-07",
    titleMr: "पवित्रधाम टेकडीवर वृक्षारोपण",
    placeMr: "पवित्रधाम टेकडी, सिंदी (मेघे)",
    date: "2026-07-07",
    treesPlanted: 120,
    treesSurviving: 104,
    speciesMr: ["कडुनिंब", "वड", "पिंपळ"],
    careNoteMr: "प्रत्येक झाडाला संरक्षक जाळी लावली आहे.",
    image: ph("planting-01", "टेकडीवर रोपे लावताना स्वयंसेवक (नमुना चित्र)"),
    isSample: true,
  },
  {
    id: "p-2026-06-06",
    titleMr: "शिवराज्याभिषेक दिन — मोहिमेची सुरुवात",
    placeMr: "धाम नदी काठ, वर्धा",
    date: "2026-06-06",
    treesPlanted: 200,
    treesSurviving: 171,
    speciesMr: ["अर्जुन", "जांभूळ", "करंज", "वड"],
    partnerMr: "ग्रीन वॉरियर्स ग्रुप",
    careNoteMr: "पावसाळ्यानंतर ठिबक सिंचनाची सोय केली.",
    image: ph("planting-05", "नदीकाठी वृक्षारोपणासाठी जमलेली टीम (नमुना चित्र)"),
    isSample: true,
  },
  {
    id: "p-2026-02-19",
    titleMr: "शिवजयंती — पहिल्या वर्षाची सांगता",
    placeMr: "गणेश नगर उद्यान, वर्धा",
    date: "2026-02-19",
    treesPlanted: 180,
    treesSurviving: 158,
    speciesMr: ["आंबा", "कडुनिंब", "सीताफळ"],
    careNoteMr: "उन्हाळ्यात रोज सकाळी पाणी देऊन झाडे जगवली.",
    image: ph("planting-06", "उद्यानात लावलेली रोपे (नमुना चित्र)"),
    isSample: true,
  },
];

// SAMPLE gallery with PLACEHOLDER photos.
export const gallery: GalleryPhoto[] = [
  { id: "g01", category: "planting", captionMr: "टेकडीवर रोपे लावताना स्वयंसेवक", placeMr: "पवित्रधाम टेकडी, सिंदी (मेघे)", date: "2026-07-07", image: ph("gallery-01", "टेकडीवर रोपे लावताना स्वयंसेवक (नमुना चित्र)"), isSample: true },
  { id: "g02", category: "care", captionMr: "नव्या रोपांना सकाळचे पाणी", placeMr: "सिंदी (मेघे) – वर्धा मार्ग", date: "2026-10-12", image: ph("gallery-02", "रोपांना पाणी देताना (नमुना चित्र)"), isSample: true },
  { id: "g03", category: "collection", captionMr: "रद्दीचे गठ्ठे वजनासाठी तयार", placeMr: "संकलन केंद्र, सिंदी (मेघे)", date: "2026-09-21", image: ph("gallery-03", "रद्दीचे गठ्ठे (नमुना चित्र)"), isSample: true },
  { id: "g04", category: "schools", captionMr: "शाळेत रद्दी संकलन मोहीम", placeMr: "आदर्श विद्यालय, सिंदी (मेघे)", date: "2026-08-10", image: ph("gallery-04", "शाळेत रद्दी संकलन (नमुना चित्र)", true), isSample: true },
  { id: "g05", category: "planting", captionMr: "नदीकाठी वृक्षारोपणासाठी जमलेली टीम", placeMr: "धाम नदी काठ, वर्धा", date: "2026-06-06", image: ph("gallery-05", "वृक्षारोपणासाठी जमलेली टीम (नमुना चित्र)"), isSample: true },
  { id: "g06", category: "care", captionMr: "एका वर्षात वाढलेली झाडे", placeMr: "गणेश नगर उद्यान, वर्धा", date: "2026-11-02", image: ph("gallery-06", "वाढलेली झाडे (नमुना चित्र)"), isSample: true },
  { id: "g07", category: "planting", captionMr: "विद्यार्थ्यांनी लावलेले पहिले झाड", placeMr: "हरित विज्ञान महाविद्यालय, वर्धा", date: "2026-11-14", image: ph("gallery-07", "विद्यार्थी झाड लावताना (नमुना चित्र)", true), isSample: true },
  { id: "g08", category: "collection", captionMr: "घराघरातून गोळा केलेली रद्दी", placeMr: "सिंदी (मेघे)", date: "2026-09-07", image: ph("gallery-08", "गोळा केलेली रद्दी (नमुना चित्र)"), isSample: true },
  { id: "g09", category: "care", captionMr: "उन्हाळ्यात टँकरने पाणी", placeMr: "पवित्रधाम टेकडी, सिंदी (मेघे)", date: "2026-05-18", image: ph("gallery-09", "झाडांना टँकरने पाणी (नमुना चित्र)"), isSample: true },
  { id: "g10", category: "schools", captionMr: "महाविद्यालयात पर्यावरण जनजागृती", placeMr: "प्रगती अभियांत्रिकी महाविद्यालय, वर्धा", date: "2026-07-25", image: ph("gallery-10", "महाविद्यालयात जनजागृती कार्यक्रम (नमुना चित्र)"), isSample: true },
  { id: "g11", category: "care", captionMr: "संरक्षक जाळी लावलेले झाड", placeMr: "सिंदी (मेघे) – वर्धा मार्ग", date: "2026-10-20", image: ph("gallery-11", "संरक्षक जाळी असलेले झाड (नमुना चित्र)", true), isSample: true },
  { id: "g12", category: "planting", captionMr: "मोहिमेनंतर संपूर्ण टीम", placeMr: "गणेश नगर उद्यान, वर्धा", date: "2026-02-19", image: ph("gallery-12", "स्वयंसेवकांची टीम (नमुना चित्र)"), isSample: true },
];

export const aboutImage: ImageAsset = ph("about-team", "वृक्ष सेवा समितीची टीम (नमुना चित्र)");
export const collectionImage: ImageAsset = ph("collection-drive", "रद्दी संकलन मोहीम (नमुना चित्र)");

// SAMPLE names. Only name, type and trees are ever shown.
export const leaderboard: LeaderboardEntry[] = [
  { id: "s1", nameMr: "आदर्श विद्यालय, सिंदी (मेघे)", type: "school", trees: 150, searchAlias: "Adarsh Vidyalaya Sindi Meghe", isSample: true },
  { id: "c1", nameMr: "हरित विज्ञान महाविद्यालय", type: "college", trees: 136, searchAlias: "Harit Vigyan Mahavidyalaya College", isSample: true },
  { id: "s2", nameMr: "ज्ञानदीप हायस्कूल", type: "school", trees: 120, searchAlias: "Dnyandeep High School", isSample: true },
  { id: "o1", nameMr: "युवा मित्र मंडळ, वर्धा", type: "organisation", trees: 110, searchAlias: "Yuva Mitra Mandal Wardha", isSample: true },
  { id: "c2", nameMr: "प्रगती अभियांत्रिकी महाविद्यालय", type: "college", trees: 98, searchAlias: "Pragati Engineering College", isSample: true },
  { id: "s3", nameMr: "सरस्वती विद्या मंदिर", type: "school", trees: 84, searchAlias: "Saraswati Vidya Mandir", isSample: true },
  { id: "o2", nameMr: "ग्रीन वॉरियर्स ग्रुप", type: "organisation", trees: 72, searchAlias: "Green Warriors Group", isSample: true },
  { id: "c3", nameMr: "लोकमान्य कला व वाणिज्य महाविद्यालय", type: "college", trees: 64, searchAlias: "Lokmanya Arts Commerce College", isSample: true },
  { id: "s4", nameMr: "नवभारत प्राथमिक शाळा", type: "school", trees: 56, searchAlias: "Navbharat Primary School", isSample: true },
  { id: "o3", nameMr: "महिला बचत गट, सिंदी (मेघे)", type: "organisation", trees: 46, searchAlias: "Mahila Bachat Gat Sindi", isSample: true },
  { id: "c4", nameMr: "विद्याभारती कनिष्ठ महाविद्यालय", type: "college", trees: 38, searchAlias: "Vidyabharati Junior College", isSample: true },
  { id: "s5", nameMr: "जनता विद्यालय", type: "school", trees: 35, searchAlias: "Janata Vidyalaya", isSample: true },
  { id: "o4", nameMr: "व्यापारी संघ, सिंदी (मेघे)", type: "organisation", trees: 25, searchAlias: "Vyapari Sangh Sindi", isSample: true },
  { id: "i1", nameMr: "राहुल पाटील", type: "individual", trees: 24, searchAlias: "Rahul Patil", isSample: true },
  { id: "i2", nameMr: "सुनीता देशमुख", type: "individual", trees: 19, searchAlias: "Sunita Deshmukh", isSample: true },
  { id: "i3", nameMr: "अमोल ठाकरे", type: "individual", trees: 15, searchAlias: "Amol Thakare", isSample: true },
  { id: "i4", nameMr: "प्रिया काळे", type: "individual", trees: 12, searchAlias: "Priya Kale", isSample: true },
  { id: "i5", nameMr: "विजय राऊत", type: "individual", trees: 12, searchAlias: "Vijay Raut", isSample: true },
  { id: "i6", nameMr: "स्नेहा वानखेडे", type: "individual", trees: 10, searchAlias: "Sneha Wankhede", isSample: true },
  { id: "i7", nameMr: "गणेश भोयर", type: "individual", trees: 8, searchAlias: "Ganesh Bhoyar", isSample: true },
  { id: "i8", nameMr: "कविता मेश्राम", type: "individual", trees: 6, searchAlias: "Kavita Meshram", isSample: true },
  { id: "i9", nameMr: "संदीप गावंडे", type: "individual", trees: 5, searchAlias: "Sandeep Gawande", isSample: true },
];
