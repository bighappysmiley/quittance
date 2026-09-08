import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const brand = Fraunces({
  variable: "--font-brand",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quittance",
  description:
    "A private way to track who owes what — synced to your account, seen only by you.",
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
      data-density="compact"
      className={`${brand.variable} ${body.variable} h-full antialiased`}
    >
      <body className="app-root min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
