import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
export const metadata: Metadata={title:"Contact",description:"Contact the Vehicle Management System team.",alternates:{canonical:"/contact"}};
export default function ContactPage(){return <main><section className="page-hero"><div className="shell"><h1>Let’s talk fleet operations.</h1><p>Have a question about Vehicle Management System? Send us a message and we’ll be glad to help.</p></div></section><section className="section"><div className="shell"><ContactForm/></div></section></main>}
