import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniDesk — The AI Chief of Staff",
  description: "AI-powered strategic research, comparison, and human-in-the-loop action workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
