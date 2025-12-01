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
    default: "GuardianCLI - The Ultimate CLI for Modern Developers",
    template: "%s | GuardianCLI",
  },
  description: "Build, deploy, and manage your applications with speed and precision. GuardianCLI is designed for efficiency and built for scale.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://guardian-cli.app",
    title: "GuardianCLI - The Ultimate CLI for Modern Developers",
    description: "Build, deploy, and manage your applications with speed and precision.",
    siteName: "GuardianCLI",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "GuardianCLI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GuardianCLI - The Ultimate CLI for Modern Developers",
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
