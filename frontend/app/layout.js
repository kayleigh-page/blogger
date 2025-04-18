import NavBar from "../components/NavBar";

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

export const metadata = {
  title: "Blogger",
  robots: "noindex, nofollow",
  appleWebApp: {
    title: "Blogger",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: "/favicon.ico", // optional favicon
    apple: "/apple-touch-icon.png",
  },
  manifest: "/logo/manifest.json",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
