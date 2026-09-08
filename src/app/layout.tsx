import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
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
  appleWebApp: {
    capable: true,
    title: "Quittance",
    statusBarStyle: "default",
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
