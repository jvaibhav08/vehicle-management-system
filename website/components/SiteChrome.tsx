import Image from "next/image";
import Link from "next/link";
import { Car } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { getFooter, getNavigation, getSiteSettings } from "@/sanity/lib/queries";

const fallbackLinks = [{ label: "Features", href: "/features" }, { label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }];
const fallbackFooterLinks = [...fallbackLinks, { label: "Privacy", href: "/privacy-policy" }, { label: "Terms", href: "/terms" }];

function BrandMark({ logo, title }: { logo?: any; title: string }) {
  const image = logo ? urlFor(logo).width(80).height(80).url() : null;
  return image ? <Image className="brand-mark" src={image} alt={`${title} logo`} width={40} height={40} /> : <span className="brand-mark"><Car size={20} /></span>;
}

export async function Header() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);
  const title = settings?.title || "Vehicle Management System";
  const brandTitle = title.endsWith(" System") ? title.slice(0, -7) : title;
  const brandSubtitle = title.endsWith(" System") ? "System" : null;
  const appUrl = settings?.vmsUrl || process.env.NEXT_PUBLIC_VMS_APP_URL || "https://app.yourdomain.com/login";
  const links = navigation?.items?.length ? navigation.items : fallbackLinks;
  return <header className="header"><nav className="shell nav" aria-label="Main navigation"><Link className="brand" href="/"><BrandMark logo={settings?.logo} title={title} /><span>{brandTitle}{brandSubtitle && <><br /><span style={{ fontWeight: 500, color: "#9ca3af" }}>{brandSubtitle}</span></>}</span></Link><div className="nav-links">{links.map((link: { label: string; href: string }) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div><a className="button" href={appUrl}>Open VMS</a></nav></header>;
}

export async function Footer() {
  const [settings, footer] = await Promise.all([getSiteSettings(), getFooter()]);
  const title = settings?.title || "Vehicle Management System";
  const links = footer?.links?.length ? footer.links : fallbackFooterLinks;
  const copyright = footer?.copyright || `© ${new Date().getFullYear()} ${title}. All rights reserved.`;
  return <footer className="footer"><div className="shell"><div className="footer-grid"><div><div className="brand"><BrandMark logo={settings?.logo} title={title} /><span>{title}</span></div><p>{footer?.description || "Clear, dependable fleet administration for the work that keeps your business moving."}</p></div><div className="footer-links">{links.map((link: { label: string; href: string }) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div></div><div className="copyright">{copyright}</div></div></footer>;
}
