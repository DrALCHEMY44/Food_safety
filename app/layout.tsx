import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alphonseafanyu.vercel.app"),
  title: "Alphonse Afanyu | Food Process Engineer",
  description: "Food Process Engineer supporting food product development, formulation, processing, quality assurance, food safety, and shelf-life improvement in Cameroon and remotely.",
  keywords: ["Food Process Engineer", "Food Product Development", "Food Safety", "Quality Assurance", "Food Processing Cameroon"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Alphonse Afanyu | Food Process Engineer",
    description: "Practical food product development, processing, quality, and food-safety support.",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0d12" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}<Analytics /></body></html>;
}
