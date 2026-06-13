import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Build Demo | Premium Home Builder Sydney",
    template: "%s | Build Demo",
  },
  description:
    "Sydney's residential construction specialists for new homes, duplexes, knockdown rebuilds, granny flats and multi-dwelling developments.",
  keywords: [
    "home builder Sydney",
    "new homes Sydney",
    "duplex builder",
    "knockdown rebuild",
    "granny flat builder",
    "residential construction",
    "custom home builder Western Sydney",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Build Demo",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1C1B19",
              color: "#F7F4ED",
              border: "1px solid #B5694A",
            },
          }}
        />
      </body>
    </html>
  );
}
