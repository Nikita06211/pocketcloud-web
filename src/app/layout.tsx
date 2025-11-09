import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MixpanelProvider from "@/components/MixpanelProvider";

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
    default: "PocketCloud - Share Files Simply",
    template: "%s | PocketCloud",
  },
  description: "Upload any file and get a secure shareable link. Set your own expiration time from 1 hour to 48 hours. Fast, secure, and simple file sharing.",
  keywords: [
    "file sharing",
    "secure file sharing",
    "file upload",
    "shareable links",
    "file transfer",
    "temporary file sharing",
    "expiring links",
    "secure file hosting",
    "cloud file sharing",
  ],
  authors: [{ name: "PocketCloud" }],
  creator: "PocketCloud",
  publisher: "PocketCloud",
  
  metadataBase: new URL("https://pocketcloud.nikitabansal.xyz/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    
    url: "/",
    siteName: "PocketCloud",
    title: "PocketCloud - Share Files Simply",
    description: "Upload any file and get a secure shareable link. Set your own expiration time and share with confidence.",
    images: [
      {
        url: "https://you-ocean-pc.s3.ap-south-1.amazonaws.com/files/481177b1-2921-416f-bcfa-ee6d0b17f2a7?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ4NSA2EBA7SX5XR3%2F20251109%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251109T094840Z&X-Amz-Expires=3600&X-Amz-Signature=78b1c9b9503a6981c5d448fce5cd08eebcd7f94ef5363e9b8225aee2a511138f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        width: 1200,
        height: 630,
        alt: "PocketCloud - Share Files Simply",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PocketCloud - Share Files Simply",
    description: "Upload any file and get a secure shareable link. Set your own expiration time and share with confidence.",
    
    images: ["https://you-ocean-pc.s3.ap-south-1.amazonaws.com/files/481177b1-2921-416f-bcfa-ee6d0b17f2a7?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQ4NSA2EBA7SX5XR3%2F20251109%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251109T094840Z&X-Amz-Expires=3600&X-Amz-Signature=78b1c9b9503a6981c5d448fce5cd08eebcd7f94ef5363e9b8225aee2a511138f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  category: "file sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MixpanelProvider />
        {children}
      </body>
    </html>
  );
}
