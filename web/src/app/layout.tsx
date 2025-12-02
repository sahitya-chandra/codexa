import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Guardian",
    template: "%s | Guardian",
  },
  description: "Ask questions about your codebase. A powerful CLI tool that ingests your codebase and allows you to ask questions about it using Retrieval-Augmented Generation (RAG).",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/sahitya-chandra/guardian",
    title: "Guardian",
    description: "Ask questions about your codebase. A powerful CLI tool that ingests your codebase and allows you to ask questions about it using RAG.",
    siteName: "Guardian",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Guardian",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guardian",
    description: "Ask questions about your codebase. A powerful CLI tool that ingests your codebase and allows you to ask questions about it using RAG.",
    images: ["/api/og"],
    creator: "@sahitya_chandra",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
