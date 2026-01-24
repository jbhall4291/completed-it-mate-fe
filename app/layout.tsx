import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { GameProvider } from '../lib/GameContext';
import BootstrapUser from "@/components/BootstrapUser";
import Footer from "@/components/layout/Footer";
import ScrollToTop from '@/components/layout/ScrollToTop';
import PageTransition from '@/components/layout/PageTransition';
import { Analytics } from '@vercel/analytics/next';
import { UserProvider } from "@/lib/UserContext";



const SITE_URL = 'https://completeditmate.app';


const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});



export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Completed It Mate",
  description:
    "Track your game collection and completion status, with community insights - built by Johnny Hall.",
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
      "Track your video game collection — completed, in-progress, and wishlisted titles — with personal dashboards and community-wide insights.",
    url: SITE_URL,
    siteName: "Completed It Mate",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
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
      <body className="flex min-h-screen flex-col overflow-x-clip">
        <div className="mx-auto w-full max-w-[1326px] mt-[96px] lg:mt-[116px] flex flex-col flex-1">
          <UserProvider>
            <BootstrapUser />
            <GameProvider>
              <Navbar />
              <ScrollToTop />
              <main className="flex-1 w-full">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </GameProvider>
          </UserProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}