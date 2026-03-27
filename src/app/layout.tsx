import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Oura Analytics | Premium Health Dashboard",
  description: "Comprehensive Oura Ring data analytics and AI-powered insights",
  icons: { icon: "/favicon.ico" },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "Oura Analytics",
    description: "Premium health insights powered by your Oura Ring data and AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className={`${roboto.className} antialiased`} style={{ fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-oura-600 focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
