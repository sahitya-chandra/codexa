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
    default: "AgentCLI - The Ultimate CLI for Modern Developers",
    template: "%s | AgentCLI",
  },
  description: "Build, deploy, and manage your applications with speed and precision. AgentCLI is designed for efficiency and built for scale.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agent-cli.app",
    title: "AgentCLI - The Ultimate CLI for Modern Developers",
    description: "Build, deploy, and manage your applications with speed and precision.",
    siteName: "AgentCLI",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "AgentCLI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentCLI - The Ultimate CLI for Modern Developers",
    description: "Build, deploy, and manage your applications with speed and precision.",
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
