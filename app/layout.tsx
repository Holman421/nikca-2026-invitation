import type { Metadata } from "next";
import { Courier_Prime, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Scotland Yard Database",
  description: "Victorian noir invitation and authentication terminal",
  openGraph: {
    title: "Scotland Yard Database",
    description: "Victorian noir invitation and authentication terminal",
    type: "website",
    siteName: "Scotland Yard Database",
    images: [
      {
        url: "/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Scotland Yard invitation preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scotland Yard Database",
    description: "Victorian noir invitation and authentication terminal",
    images: ["/thumbnail.jpg"],
  },
  icons: {
    icon: "/flashlight.png",
    shortcut: "/flashlight.png",
    apple: "/flashlight.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
