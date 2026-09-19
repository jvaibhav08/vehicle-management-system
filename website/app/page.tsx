import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Sparkles } from "lucide-react";
import { Checks, FeatureCards, PostCards } from "@/components/Content";
import { urlFor } from "@/sanity/lib/image";
import { getHomePage, getPosts, getSiteSettings } from "@/sanity/lib/queries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage();
  const seo = home?.seo;
  const ogImage = seo?.ogImage ? urlFor(seo.ogImage).width(1200).height(630).url() : undefined;
  return { title: seo?.metaTitle, description: seo?.metaDescription, robots: seo?.noIndex ? { index: false, follow: false } : undefined, openGraph: { title: seo?.metaTitle, description: seo?.metaDescription, images: ogImage ? [{ url: ogImage }] : undefined } };
}

export default async function Home() {
  const [home, posts, settings] = await Promise.all([getHomePage(), getPosts(3), getSiteSettings()]);
  const appUrl = settings?.vmsUrl || process.env.NEXT_PUBLIC_VMS_APP_URL || "https://app.yourdomain.com/login";
  const heroImage = home?.heroImage ? urlFor(home.heroImage).width(1200).height(900).url() : null;
  const structuredData = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: settings?.title || "Vehicle Management System", applicationCategory: "BusinessApplication", operatingSystem: "Web" };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <section className="hero"><div className="shell hero-grid">
      <div><span className="eyebrow"><Sparkles size={14} />{home?.heroEyebrow || "Fleet operations, simplified"}</span><h1>{home?.heroTitle || "Everything your fleet needs, in one clear view."}</h1><p>{home?.heroText || "Vehicle Management System brings your vehicles, insurance and PUC records into a single calm, reliable workspace."}</p><div className="actions"><a className="button" href={appUrl}>{home?.heroCtaLabel || "Open Vehicle Management"}<ArrowRight size={16} /></a><Link className="button secondary" href="/features">Explore features</Link></div></div>
      {heroImage ? <Image className="hero-image" src={heroImage} alt={home?.heroImage?.alt || home?.heroTitle || "Vehicle Management System"} width={1200} height={900} priority sizes="(max-width: 800px) 100vw, 50vw" /> : <div className="dashboard-preview" aria-label="Vehicle Management System dashboard preview"><div className="preview-top"><div><b>Fleet overview</b><div style={{ fontSize: 12, opacity: .8, marginTop: 5 }}>Your records, at a glance</div></div><Car size={24} /></div><div className="mini-grid"><div className="mini-card"><small>Vehicles</small><b>24</b></div><div className="mini-card"><small>Insurance</small><b>18</b></div><div className="mini-card"><small>PUC valid</small><b>22</b></div></div></div>}
    </div></section>
    <section className="section"><div className="shell"><div className="section-heading"><h2>Made for everyday fleet clarity.</h2><p>Focus on the records that matter, with the clean, straightforward experience your team deserves.</p></div><FeatureCards features={home?.features} /></div></section>
    <section className="section alt"><div className="shell split"><div><span className="eyebrow">A more organized operation</span><h2 style={{ fontSize: 36, letterSpacing: "-.04em", marginBottom: 0 }}>Less chasing. More confidence.</h2><p className="lead">Whether you manage a handful of vehicles or a growing fleet, VMS helps turn scattered information into an easy daily routine.</p><Checks /><Link className="button secondary" href="/about">Why VMS</Link></div><div className="card" style={{ padding: 34 }}><div className="icon-box"><Car size={23} /></div><h3 style={{ fontSize: 24 }}>Built around the work you already do.</h3><p>Register vehicles, monitor insurance coverage, and keep PUC certificates close at hand—all in a visual system designed to make status easy to understand.</p></div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><h2>Latest from VMS</h2><p>Helpful, practical guidance for maintaining a well-run fleet.</p></div><PostCards posts={posts} /><div style={{ marginTop: 26 }}><Link className="button secondary" href="/blog">View all articles</Link></div></div></section>
    <section className="shell" style={{ paddingBottom: 86 }}><div className="cta"><h2>Ready for a clearer fleet workflow?</h2><p>Bring vehicles, insurance, and PUC management into one focused workspace.</p><a className="button" href={appUrl}>Login to VMS <ArrowRight size={16} /></a></div></section>
  </main>;
}
