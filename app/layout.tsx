import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { GameProvider } from '../lib/GameContext';
import BootstrapUser from "@/components/BootstrapUser";
import Footer from "@/components/layout/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";


const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});



export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Completed It Mate",
  description:
    "Track your game collection, completion status, and playtime insights — built by Johnny Hall.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "96x96" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Completed It Mate",
    description:
      "Track your game library and completion progress in style.",
    url: "https://completeditmate.app",
    siteName: "Completed It Mate",
    images: [
      {
        url: "/og-image.png", // replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "Completed It Mate preview",
      },
    ],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1e20",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="flex min-h-screen flex-col mt-[96px] lg:mt-[116px] max-w-[1326px] overflow-x-clip mx-auto">
        <BootstrapUser />
        <GameProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </GameProvider>
      </body>
    </html>
  );
}