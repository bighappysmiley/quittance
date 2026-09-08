import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import { InstallBanner } from "@/components/InstallBanner";
import "./globals.css";

const brand = Fraunces({
  variable: "--font-brand",
  subsets: ["latin"],
});

const ui = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
});

const num = IBM_Plex_Mono({
  variable: "--font-num",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quittance",
  description:
    "A private way to track who owes what — money or things, across your devices.",
  applicationName: "Quittance",
  manifest: "/manifest.webmanifest",
  themeColor: "#1f6b57",
  appleWebApp: {
    capable: true,
    title: "Quittance",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      {
        url: "/icons/apple-touch-icon-152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-120.png",
        sizes: "120x120",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-density="comfortable"
      className={`${brand.variable} ${ui.variable} ${num.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProviders>
          <InstallBanner />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
