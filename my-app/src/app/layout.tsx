import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.scss";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personligt Dashboard",
  description: "Et personligt dashboard bygget i Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className={spaceGrotesk.variable}>
        {children}
      </body>
    </html>
  );
}
