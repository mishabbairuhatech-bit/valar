import type { Metadata } from "next";
import { Anybody, Outfit, Inter } from "next/font/google";
import "./globals.css";

const display = Anybody({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

const brand = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-brand",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velar — Live in Irreplaceable",
  description:
    "Stately homes built with vision, scope, and architectural finesse.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${brand.variable} ${body.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
