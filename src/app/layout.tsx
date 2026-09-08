import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const ui = Space_Grotesk({
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
  description: "Private IOU tracker with accounts synced to Neon Postgres.",
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
      className={`${ui.variable} ${num.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
