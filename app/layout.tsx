import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digistore24 Automation Suite",
  description: "Complete automation suite for Digistore24 with Next.js 14, TypeScript, and real-time webhooks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
