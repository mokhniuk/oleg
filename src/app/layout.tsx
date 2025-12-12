import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { PageTransitionProvider } from "@/contexts/PageTransitionContext";
import PageTransitionOverlay from "@/components/PageTransitionOverlay/PageTransitionOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oleg Mokhniuk",
  description: "Frontend Engineer and Designer based in Berlin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <PageTransitionProvider>
          <PageTransitionOverlay />
          <Header />
          {children}
          <Footer />
        </PageTransitionProvider>
      </body>
    </html>
  );
}
