import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "300", "400", "700"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "LegalConnect — The Law Firm Operating System",
  description:
    "LegalConnect is a modern Law Firm Operating System that replaces disconnected tools with one integrated platform for matter management, document management, trust accounting, billing, and more.",
  openGraph: {
    title: "LegalConnect — The Law Firm Operating System",
    description:
      "Replace disconnected legal tools with one integrated platform. Trust accounting, matter management, billing, and more — built for modern law firms.",
    type: "website",
    siteName: "LegalConnect",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        roboto.variable,
        newsreader.variable,
        plexMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
