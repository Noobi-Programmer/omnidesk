import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniDesk — Executive Intelligence & Supplier Workspace",
  description: "B2B Research-to-Decision-to-Action Platform powered by TinyFish web intelligence and human-in-the-loop action drafting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${jetbrainsMono.variable} min-h-screen bg-surface text-on-surface antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
