import type { Metadata } from "next";
import "./globals.css";
import { Footer, Header } from "@/components/SiteChrome";
import { getSiteSettings } from "@/sanity/lib/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const settings = await getSiteSettings(); const seo = settings?.seo; const title = seo?.metaTitle || settings?.title || "Vehicle Management System"; const description = seo?.metaDescription || settings?.description || "A simpler, clearer way to manage vehicles, insurance and PUC records."; return { metadataBase: new URL(siteUrl), title: { default: title, template: `%s | ${title}` }, description, alternates: { canonical: "/" }, robots: seo?.noIndex ? { index: false, follow: false } : undefined, openGraph: { type: "website", siteName: settings?.title || "Vehicle Management System", url: siteUrl, title, description }, twitter: { card: "summary_large_image", title, description } }; }
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Header />{children}<Footer /></body></html>; }
