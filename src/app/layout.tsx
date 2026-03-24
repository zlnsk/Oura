import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: "Oura Analytics | Premium Health Dashboard",
  description: "Comprehensive Oura Ring data analytics and AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
