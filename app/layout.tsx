import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Build Demo | Premium Construction Sydney",
    template: "%s | Build Demo",
  },
  description:
    "Premium residential and commercial construction across Greater Sydney. New homes, duplexes, granny flats, knockdown rebuilds and renovations.",
  keywords: [
    "construction",
    "home builder",
    "Sydney",
    "new homes",
    "duplex",
    "granny flat",
    "renovation",
    "knockdown rebuild",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Build Demo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1C1C1E",
              color: "#F5F4F0",
              border: "1px solid #C9A84C",
            },
          }}
        />
      </body>
    </html>
  );
}
