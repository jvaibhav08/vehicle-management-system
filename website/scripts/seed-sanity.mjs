import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const client = createClient({
  projectId: "g9jd8pvn",
  dataset: "production",
  apiVersion: env.SANITY_API_VERSION || "2026-09-12",
  token: env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

const block = (text, key) => ({
  _key: key,
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
});

const siteDescription = "A simpler, clearer way to manage vehicles, insurance and PUC records.";
const documents = [
  {
    _id: "siteSettings",
    _type: "siteSettings",
    title: "Vehicle Management System",
    description: siteDescription,
    vmsUrl: env.NEXT_PUBLIC_VMS_APP_URL || "http://localhost:5173/login",
    seo: {
      _type: "seo",
      metaTitle: "Vehicle Management System",
      metaDescription: siteDescription,
      noIndex: false,
    },
  },
  {
    _id: "navigation",
    _type: "navigation",
    title: "Primary navigation",
    items: [
      { _key: "features", label: "Features", href: "/features" },
      { _key: "about", label: "About", href: "/about" },
      { _key: "blog", label: "Blog", href: "/blog" },
      { _key: "contact", label: "Contact", href: "/contact" },
    ],
  },
  {
    _id: "footer",
    _type: "footer",
    description: "Clear, dependable fleet administration for the work that keeps your business moving.",
    copyright: "© 2026 Vehicle Management System. All rights reserved.",
    links: [
      { _key: "features", label: "Features", href: "/features" },
      { _key: "about", label: "About", href: "/about" },
      { _key: "blog", label: "Blog", href: "/blog" },
      { _key: "contact", label: "Contact", href: "/contact" },
      { _key: "privacy", label: "Privacy", href: "/privacy-policy" },
      { _key: "terms", label: "Terms", href: "/terms" },
    ],
  },
  {
    _id: "homePage",
    _type: "homePage",
    heroEyebrow: "Fleet operations, simplified",
    heroTitle: "Everything your fleet needs, in one clear view.",
    heroText: "Vehicle Management System brings your vehicles, insurance and PUC records into a single calm, reliable workspace.",
    heroCtaLabel: "Open Vehicle Management",
    features: [
      { _key: "vehicle-records", title: "Vehicle records", description: "Keep registration, vehicle and ownership details in one dependable place.", icon: "car" },
      { _key: "insurance-visibility", title: "Insurance visibility", description: "Stay ahead of policies and renewal dates with clear status at a glance.", icon: "shield" },
      { _key: "puc-compliance", title: "PUC compliance", description: "Track certificates and expiry dates without searching through paperwork.", icon: "file" },
    ],
    seo: {
      _type: "seo",
      metaTitle: "Vehicle Management System",
      metaDescription: siteDescription,
      noIndex: false,
    },
  },
  {
    _id: "page-privacy-policy",
    _type: "page",
    title: "Privacy Policy",
    slug: { _type: "slug", current: "privacy-policy" },
    intro: "We respect your privacy and are committed to handling information responsibly.",
    content: [
      block("We respect your privacy and are committed to handling information responsibly.", "privacy-intro"),
      block("This page can be maintained in Sanity through the Page document type using the slug privacy-policy.", "privacy-maintenance"),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Privacy Policy",
      metaDescription: "Vehicle Management System privacy policy.",
      noIndex: false,
    },
  },
  {
    _id: "page-terms",
    _type: "page",
    title: "Terms of Use",
    slug: { _type: "slug", current: "terms" },
    intro: "These terms describe the conditions for using Vehicle Management System.",
    content: [
      block("These terms describe the conditions for using Vehicle Management System.", "terms-intro"),
      block("This page can be maintained in Sanity through the Page document type using the slug terms.", "terms-maintenance"),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Terms of Use",
      metaDescription: "Vehicle Management System terms of use.",
      noIndex: false,
    },
  },
];

await client.transaction(documents.map((document) => ({ createOrReplace: document }))).commit();
console.log(`Seeded ${documents.length} documents into g9jd8pvn/production.`);
