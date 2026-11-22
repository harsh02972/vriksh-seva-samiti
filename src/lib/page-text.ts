/**
 * Editable page texts (stored in the `site_content` table, one row per page).
 *
 * Each field has a built-in default (the Phase 1 text). The admin "Page texts" screen
 * is generated from this list. Anything left empty in the database falls back to the
 * default, so the website never shows a blank heading.
 *
 * Kinds:
 *   en      – English heading / label (shown with lang="en")
 *   mr      – one line of Marathi
 *   mr-long – a Marathi paragraph (new lines start a new paragraph)
 *   lines   – a list, one item per line
 *   faq     – questions and answers: first line = question, next lines = answer, blank line between
 *   image   – a photo (uploaded in the admin)
 */
import type { ImageAsset } from "@/data/site";
import { aboutImage, collectionImage } from "@/data/site";

type TextKind = "en" | "mr" | "mr-long" | "lines" | "faq" | "url" | "phone" | "email";

export interface TextField {
  kind: TextKind;
  label: string;
  group: string;
  default: string;
  help?: string;
}
export interface ImageField {
  kind: "image";
  label: string;
  group: string;
  default: ImageAsset;
  help?: string;
}
export type FieldDef = TextField | ImageField;

const f = (group: string, kind: TextKind, label: string, def: string, help?: string): TextField => ({
  group,
  kind,
  label,
  default: def,
  help,
});
const img = (group: string, label: string, def: ImageAsset, help?: string): ImageField => ({
  group,
  kind: "image",
  label,
  default: def,
  help,
});

/* ------------------------------------------------------------------ */

const home = {
  heroBadge: f("Hero (top of page)", "mr", "Small badge above the heading", "सिंदी (मेघे), वर्धा · हिरव्या वर्ध्यासाठी"),
  heroTitle: f(
    "Hero (top of page)",
    "en",
    "Main heading",
    "Your Scrap Can\nGrow a Forest",
    "English. Press Enter for a line break. The last word is underlined in green.",
  ),
  heroIntro: f(
    "Hero (top of page)",
    "mr-long",
    "Intro text",
    "शाळा, महाविद्यालये आणि नागरिकांकडून मिळालेली रद्दी, पेपर आणि भंगार आम्ही विकतो आणि त्या पैशातून वर्धा शहरात झाडे लावतो. प्रत्येक झाड मोठे होईपर्यंत आमची टीम त्याला पाणी घालते आणि त्याची काळजी घेते.",
  ),
  heroButtonPrimary: f("Hero (top of page)", "mr", "Green button", "रद्दी दान करा"),
  heroButtonSecondary: f("Hero (top of page)", "mr", "White button", "आमचे काम पहा"),

  impactTitle: f("Impact numbers", "en", "Heading", "Our Green Impact"),
  impactIntro: f("Impact numbers", "mr", "Text under heading", "प्रत्येक किलो रद्दी म्हणजे हिरव्या वर्ध्याकडे एक पाऊल."),

  aboutEyebrow: f("About preview", "en", "Small label", "About Us"),
  aboutTitle: f("About preview", "en", "Heading", "Planting Trees, Caring for Life"),
  aboutText: f(
    "About preview",
    "mr-long",
    "Text (each line = one paragraph)",
    "वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा ही पर्यावरणासाठी काम करणारी समिती आहे. “वृक्षारोपण व संगोपन हेच खरे ध्येय जीवन” हे आमचे ब्रीदवाक्य आहे. आम्ही फक्त झाडे लावत नाही, तर ती मोठी होईपर्यंत त्यांची काळजी घेतो.\nलोकांकडून मिळालेली रद्दी आणि भंगार विकून येणारा पैसा वृक्षारोपणासाठी वापरला जातो. त्यामुळे कचरा कमी होतो आणि हिरवळ वाढते — दोन्ही एकाच वेळी.",
  ),

  workflowEyebrow: f("Workflow", "en", "Small label", "Our Workflow"),
  workflowTitle: f("Workflow", "en", "Heading", "How It Works"),
  workflowIntro: f("Workflow", "mr", "Text under heading", "रद्दी देण्यापासून झाड मोठे होईपर्यंत — फक्त ५ सोप्या पायऱ्या."),

  videoIntro: f(
    "Video",
    "mr",
    "Text under the video heading",
    "एक छोटा व्हिडिओ — आवाजासह. प्ले बटण दाबल्यावरच सुरू होतो.",
    "The video heading itself is set on the Video screen.",
  ),

  plantingsTitle: f("Latest plantings", "en", "Heading", "Latest Plantings"),
  plantingsIntro: f("Latest plantings", "mr", "Text under heading", "नुकत्याच झालेल्या वृक्षारोपण मोहिमा — आणि त्यातील किती झाडे जगली, तेही."),

  galleryTitle: f("Photos on Home", "en", "Heading", "Moments From the Field", "Shown only when at least one gallery photo has “Show on Home” ticked."),
  galleryIntro: f("Photos on Home", "mr", "Text under heading", "संकलन, वृक्षारोपण आणि संगोपनाचे काही क्षण."),

  leadersTitle: f("Leaderboard top 5", "en", "Heading", "Our Green Champions"),
  leadersIntro: f(
    "Leaderboard top 5",
    "mr-long",
    "Text under heading",
    "ज्यांच्या रद्दीमुळे सर्वाधिक झाडे लागली — शाळा, महाविद्यालये, संस्था आणि नागरिक. मनःपूर्वक धन्यवाद!",
  ),

  ctaTitle: f("Call to action (green banner, all pages)", "en", "Heading", "Start Your Green Journey"),
  ctaText: f(
    "Call to action (green banner, all pages)",
    "mr",
    "Text",
    "आजच रद्दी दान करा आणि वर्ध्यात आणखी एक झाड लावायला व जगवायला मदत करा.",
  ),
};

const about = {
  heroTitle: f("Top of page", "en", "Page heading", "Planting Trees, Caring for Life"),
  heroIntro: f(
    "Top of page",
    "mr-long",
    "Intro text",
    "“वृक्षारोपण व संगोपन हेच खरे ध्येय जीवन” — हे आमचे ब्रीदवाक्य. सिंदी (मेघे), वर्धा येथील नागरिकांनी सुरू केलेली ही पर्यावरण सेवा समिती आहे.",
  ),
  storyTitle: f("Our story", "en", "Heading", "From Scrap to Shade"),
  storyText: f(
    "Our story",
    "mr-long",
    "Story (each line = one paragraph)",
    "वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा ही पर्यावरणासाठी काम करणारी समिती आहे. घराघरात, शाळांमध्ये आणि कार्यालयांमध्ये पडून असलेली रद्दी कचऱ्यात जाऊ नये, आणि तिच्यातून काहीतरी चांगले उभे राहावे — या विचारातून आमचे काम सुरू झाले.\nआम्ही शाळा, महाविद्यालये आणि नागरिकांकडून रद्दी पेपर व भंगार गोळा करतो, ते विकतो आणि त्यातून येणारा पैसा फक्त वृक्षारोपण व संगोपनासाठी वापरतो. झाड लावणे सोपे आहे; ते जगवणे खरे काम आहे. म्हणूनच आमची टीम प्रत्येक झाडाला ते मोठे होईपर्यंत पाणी घालते आणि त्याची काळजी घेते.\nआज आमचे सर्व अपडेट्स WhatsApp वर जातात. ही वेबसाइट आमच्या कामाची पारदर्शक नोंद आहे — किती झाडे लागली, किती जगली आणि कोणाच्या मदतीने.",
  ),
  storyImage: img("Our story", "Story photo", aboutImage),

  missionTitle: f("Mission (3 values, also on Home)", "en", "Heading", "Plant. Protect. Prove."),
  missionIntro: f("Mission (3 values, also on Home)", "mr", "Text under heading", "आमच्या कामाची तीन तत्त्वे — प्रत्येक झाडासाठी."),
  value1Title: f("Mission (3 values, also on Home)", "en", "Value 1 — title", "Plant"),
  value1Text: f("Mission (3 values, also on Home)", "mr", "Value 1 — text", "योग्य ठिकाणी, योग्य झाड"),
  value2Title: f("Mission (3 values, also on Home)", "en", "Value 2 — title", "Protect"),
  value2Text: f("Mission (3 values, also on Home)", "mr", "Value 2 — text", "पाणी, कुंपण आणि निगा"),
  value3Title: f("Mission (3 values, also on Home)", "en", "Value 3 — title", "Prove"),
  value3Text: f("Mission (3 values, also on Home)", "mr", "Value 3 — text", "प्रत्येक झाडाचा फोटो व नोंद"),

  promiseTitle: f("Our promise", "en", "Heading", "Our Promise"),
  promise1Title: f("Our promise", "en", "Card 1 — title", "Native Trees"),
  promise1Text: f("Our promise", "mr", "Card 1 — text", "वर्ध्याच्या हवामानात चांगली वाढणारी देशी झाडे — कडुनिंब, वड, पिंपळ, करंज, जांभूळ, आंबा."),
  promise2Title: f("Our promise", "en", "Card 2 — title", "Care Until Grown"),
  promise2Text: f("Our promise", "mr", "Card 2 — text", "झाड लावून थांबत नाही. ते मोठे होईपर्यंत नियमित पाणी, संरक्षक जाळी आणि निगा."),
  promise3Title: f("Our promise", "en", "Card 3 — title", "Schools & Colleges"),
  promise3Text: f("Our promise", "mr", "Card 3 — text", "विद्यार्थ्यांना रद्दी संकलन आणि वृक्षसंगोपनात सहभागी करून पर्यावरणाचे संस्कार."),
  promise4Title: f("Our promise", "en", "Card 4 — title", "Open to Everyone"),
  promise4Text: f("Our promise", "mr", "Card 4 — text", "कोणीही रद्दी देऊ शकतो, कोणीही स्वयंसेवक होऊ शकतो. कोणतीही नोंदणी किंवा लॉगिन नाही."),
  transparencyTitle: f("Our promise", "en", "Transparency box — title", "Transparency"),
  transparencyPoints: f(
    "Our promise",
    "lines",
    "Transparency box — points (one per line)",
    "प्रत्येक वृक्षारोपणाचे ठिकाण, तारीख, झाडांची संख्या आणि जगलेली झाडे वेबसाइटवर.\nलीडरबोर्डवर फक्त नाव, प्रकार आणि झाडांची संख्या — आर्थिक रक्कम कधीही सार्वजनिक नाही.\nदात्यांची माहिती कोणालाही दिली किंवा विकली जात नाही.",
  ),

  teamTitle: f("Our team", "en", "Heading", "People Behind the Trees"),
  teamText: f("Our team", "mr-long", "Text", "समितीचे पदाधिकारी आणि स्वयंसेवक — नावे व फोटो लवकरच येथे."),
  teamMembers: f(
    "Our team",
    "lines",
    "Team members (one per line: Name — role)",
    "",
    "Example: सुरेश पाटील — अध्यक्ष. Leave empty to show “coming soon”.",
  ),
};

const howItWorks = {
  heroTitle: f("Top of page", "en", "Page heading", "How It Works"),
  heroIntro: f("Top of page", "mr-long", "Intro text", "तुमची रद्दी झाड कशी बनते? गोळा करण्यापासून झाड मोठे होईपर्यंत — ५ सोप्या पायऱ्या."),
  overviewTitle: f("Top of page", "en", "Overview heading", "Waste to Tree in 5 Steps"),

  step1Title: f("Step 1", "en", "Title", "Collect"),
  step1Text: f("Step 1", "mr-long", "Text (also on Home)", "शाळा, महाविद्यालये आणि नागरिकांकडून रद्दी पेपर, पुठ्ठा, जुनी पुस्तके आणि भंगार गोळा करतो."),
  step1Details: f("Step 1", "lines", "Details (one per line)", "शाळा व महाविद्यालयांत संकलन मोहीम\nसंकलन केंद्रावर दर आठवड्याला रद्दी स्वीकार\nजास्त रद्दी असल्यास घरून उचल"),
  step2Title: f("Step 2", "en", "Title", "Sort & Weigh"),
  step2Text: f("Step 2", "mr-long", "Text (also on Home)", "गोळा केलेली रद्दी वेगवेगळी करून तिचे वजन केले जाते आणि प्रत्येक दात्याची नोंद ठेवली जाते."),
  step2Details: f("Step 2", "lines", "Details (one per line)", "पेपर, पुठ्ठा, प्लास्टिक, धातू वेगवेगळे केले जाते\nप्रत्येक दात्याच्या नावाने किलोची नोंद\nहीच नोंद लीडरबोर्डसाठी वापरली जाते"),
  step3Title: f("Step 3", "en", "Title", "Sell & Fund"),
  step3Text: f("Step 3", "mr-long", "Text (also on Home)", "रद्दी व भंगार विकले जाते. त्यातून मिळणारा प्रत्येक रुपया फक्त झाडे लावण्यासाठी आणि जगवण्यासाठी वापरला जातो."),
  step3Details: f("Step 3", "lines", "Details (one per line)", "अधिकृत भंगार व्यापाऱ्यांना विक्री\nमिळालेला निधी फक्त रोपे, जाळी, पाणी यासाठी\nप्रत्येक व्यवहाराची अंतर्गत नोंद"),
  step4Title: f("Step 4", "en", "Title", "Plant"),
  step4Text: f("Step 4", "mr-long", "Text (also on Home)", "वर्धा शहरात योग्य ठिकाणी देशी झाडे लावली जातात — शाळा, महाविद्यालये आणि नागरिकांच्या सहभागाने."),
  step4Details: f("Step 4", "lines", "Details (one per line)", "जागेची परवानगी व योग्य जागेची निवड\nदेशी झाडांची रोपे\nदात्यांना वृक्षारोपणात सहभागी होण्याचे आमंत्रण"),
  step5Title: f("Step 5", "en", "Title", "Water & Care"),
  step5Text: f("Step 5", "mr-long", "Text (also on Home)", "झाड मोठे होईपर्यंत आमची टीम नियमित पाणी घालते, संरक्षक कुंपण लावते आणि निगा राखते."),
  step5Details: f("Step 5", "lines", "Details (one per line)", "उन्हाळ्यात नियमित पाणी (टँकर / ठिबक)\nसंरक्षक जाळी आणि आळे\nझाडांची वेळोवेळी पाहणी व जगलेल्या झाडांची नोंद"),

  acceptTitle: f("What we accept (also on Get Involved)", "en", "Heading", "What We Accept"),
  acceptIntro: f(
    "What we accept (also on Get Involved)",
    "mr-long",
    "Text under heading",
    "रद्दी स्वच्छ, कोरडी आणि शक्य असल्यास बांधून द्या — त्यामुळे वजन करणे आणि विकणे सोपे होते.",
  ),
  acceptedItems: f(
    "What we accept (also on Get Involved)",
    "lines",
    "We accept (one per line)",
    "वर्तमानपत्र / रद्दी पेपर\nपुठ्ठा व खोकी\nजुन्या वह्या-पुस्तके\nप्लास्टिक (स्वच्छ व कोरडे)\nलोखंड व धातू भंगार",
    "A short note in brackets at the end is shown smaller, e.g. प्लास्टिक (स्वच्छ व कोरडे).",
  ),
  notAcceptedItems: f(
    "What we accept (also on Get Involved)",
    "lines",
    "We don't accept (one per line)",
    "ओला कचरा / अन्न कचरा\nओली किंवा तेलकट रद्दी\nवैद्यकीय कचरा",
  ),
  acceptImage: img("What we accept (also on Get Involved)", "Photo", collectionImage),
};

const getInvolved = {
  heroTitle: f("Top of page", "en", "Page heading", "Get Involved"),
  heroIntro: f(
    "Top of page",
    "mr-long",
    "Intro text",
    "तुमच्या घरातील, शाळेतील किंवा कार्यालयातील रद्दी आम्हाला द्या. तिच्यातून वर्ध्यात झाडे लागतील — आणि आम्ही ती मोठी होईपर्यंत जपू.",
  ),
  giveTitle: f("How to give", "en", "Heading", "How to Give"),
  giveIntro: f("How to give", "mr", "Text under heading", "तुम्हाला सोयीचा मार्ग निवडा."),
  method1Title: f("How to give", "en", "Way 1 — title", "Drop It Off"),
  method1Text: f("How to give", "mr", "Way 1 — text", "तुमची रद्दी सिंदी (मेघे) येथील आमच्या संकलन केंद्रावर ठरलेल्या वेळेत आणून द्या."),
  method2Title: f("How to give", "en", "Way 2 — title", "School & College Drives"),
  method2Text: f("How to give", "mr", "Way 2 — text", "तुमच्या शाळा किंवा महाविद्यालयात रद्दी संकलन मोहीम घ्या. आमची टीम येऊन रद्दी घेऊन जाईल."),
  method3Title: f("How to give", "en", "Way 3 — title", "Home Pickup"),
  method3Text: f("How to give", "mr", "Way 3 — text", "जास्त रद्दी असल्यास फोन किंवा WhatsApp करा. आम्ही घरून उचलण्याची वेळ ठरवू."),
  tips: f(
    "Quick tips",
    "lines",
    "Tips (one per line)",
    "रद्दी कोरडी ठेवा — ओली रद्दी विकली जात नाही.\nपेपर, पुठ्ठा, प्लास्टिक व धातू वेगवेगळे ठेवा.\nपेपरचे गठ्ठे दोरीने बांधा.\nपुस्तके चांगल्या स्थितीत असल्यास वेगळी ठेवा — गरजू विद्यार्थ्यांना देता येतील.",
  ),
  pickupTitle: f("Pickup request", "en", "Heading", "Request a Pickup"),
  pickupIntro: f(
    "Pickup request",
    "mr-long",
    "Text under heading",
    "जास्त रद्दी आहे? माहिती भरा आणि WhatsApp वर पाठवा. आमची टीम तुम्हाला वेळ कळवेल.",
  ),
  volunteerTitle: f("Volunteer", "en", "Heading", "Volunteer With Us"),
  volunteerIntro: f("Volunteer", "mr", "Text under heading", "रद्दी नसेल तरी तुम्ही मदत करू शकता — वेळ देऊन."),
  volunteer1Title: f("Volunteer", "en", "Card 1 — title", "Schools & Colleges"),
  volunteer1Text: f("Volunteer", "mr", "Card 1 — text", "तुमच्या संस्थेत 'हरित सेना' सुरू करा. रद्दी संकलन मोहीम घ्या आणि विद्यार्थ्यांना झाड दत्तक द्या."),
  volunteer2Title: f("Volunteer", "en", "Card 2 — title", "Weekend Volunteers"),
  volunteer2Text: f("Volunteer", "mr", "Card 2 — text", "रविवारी सकाळी वृक्षारोपण, पाणी देणे आणि संरक्षक जाळी लावण्याच्या कामात सहभागी व्हा."),
  volunteer3Title: f("Volunteer", "en", "Card 3 — title", "Offer Support"),
  volunteer3Text: f("Volunteer", "mr", "Card 3 — text", "रोपे, जाळी, पाण्याचा टँकर, वाहन किंवा जागा देऊन मदत करू शकता. आमच्याशी बोला."),
};

const contactPage = {
  heroTitle: f("Top of page", "en", "Page heading", "Contact"),
  heroIntro: f(
    "Top of page",
    "mr-long",
    "Intro text",
    "रद्दी दान, शाळेत मोहीम, स्वयंसेवा किंवा कोणताही प्रश्न — आम्हाला नक्की संपर्क करा.",
  ),
  faqTitle: f("Questions (FAQ)", "en", "Heading", "Common Questions"),
  faqs: f(
    "Questions (FAQ)",
    "faq",
    "Questions and answers",
    "रद्दी देण्यासाठी नोंदणी करावी लागते का?\nनाही. कोणतीही नोंदणी किंवा लॉगिन नाही. फक्त रद्दी आणा किंवा आम्हाला कळवा.\n\nकिती रद्दी असेल तर घरून उचलता?\nसाधारणपणे २५ किलोपेक्षा जास्त असल्यास आम्ही घरून उचलण्याची वेळ ठरवतो. कमी असल्यास संकलन केंद्रावर आणून द्या.\n\nमाझे नाव लीडरबोर्डवर कसे येईल?\nतुम्ही दिलेल्या रद्दीची नोंद तुमच्या नावाने होते आणि त्यातून लागलेल्या झाडांच्या संख्येनुसार नाव यादीत येते. नाव नको असल्यास कळवा.\n\nआमच्या शाळेत मोहीम घेता येईल का?\nहो! शाळा व महाविद्यालयांसाठी आम्ही रद्दी संकलन आणि वृक्षारोपण मोहीम घेतो. फोन किंवा WhatsApp करा.",
    "First line = question, next line(s) = answer. Leave one empty line between questions.",
  ),
};

/** Contact details (used in the footer, Contact and Get Involved). Empty = placeholder. */
const contactDetails = {
  phone: f("Phone & WhatsApp", "phone", "Phone number", "", "With country code, e.g. +91 98765 43210"),
  whatsapp: f("Phone & WhatsApp", "phone", "WhatsApp number", "", "Leave empty to use the phone number."),
  whatsappGroup: f("Phone & WhatsApp", "url", "WhatsApp group invite link", "", "e.g. https://chat.whatsapp.com/…"),
  email: f("Email & address", "email", "Email", ""),
  address: f("Email & address", "mr", "Address (Marathi)", ""),
  mapUrl: f("Email & address", "url", "Google Maps link", "", "Open the place in Google Maps → Share → Copy link."),
  collectionHours: f("Email & address", "mr", "Collection hours (Marathi)", ""),
  facebook: f("Social links", "url", "Facebook page", ""),
  instagram: f("Social links", "url", "Instagram", ""),
  youtube: f("Social links", "url", "YouTube", ""),
};

export const PAGE_TEXTS = {
  home: { titleEn: "Home", path: "/", fields: home },
  about: { titleEn: "About Us", path: "/about", fields: about },
  how_it_works: { titleEn: "How It Works", path: "/how-it-works", fields: howItWorks },
  get_involved: { titleEn: "Get Involved", path: "/get-involved", fields: getInvolved },
  contact: { titleEn: "Contact", path: "/contact", fields: contactPage },
  contact_details: { titleEn: "Contact details & social links", path: "/contact", fields: contactDetails },
} as const;

export type ContentKey = keyof typeof PAGE_TEXTS;
export const CONTENT_KEYS = Object.keys(PAGE_TEXTS) as ContentKey[];

type FieldsOf<K extends ContentKey> = (typeof PAGE_TEXTS)[K]["fields"];
export type PageText<K extends ContentKey> = {
  [F in keyof FieldsOf<K>]: FieldsOf<K>[F] extends ImageField ? ImageAsset : string;
};

/* ------------------------------------------------------------------ */
/* Helpers for rendering                                               */
/* ------------------------------------------------------------------ */

/** Non-empty trimmed lines. */
export function lines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "प्लास्टिक (स्वच्छ व कोरडे)" → { label: "प्लास्टिक", note: "स्वच्छ व कोरडे" } */
export function labelWithNote(line: string) {
  const m = line.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  return m ? { label: m[1], note: m[2] } : { label: line, note: undefined };
}

export function parseFaqs(text: string) {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => lines(block))
    .filter((b) => b.length >= 2)
    .map(([q, ...a]) => ({ q, a: a.join(" ") }));
}
