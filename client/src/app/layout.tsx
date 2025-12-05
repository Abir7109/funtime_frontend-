import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import AppFooter from "@/components/AppFooter";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fun Together",
  description: "Play. Chill. Win. Together.",
  openGraph: {
    title: "Fun Together",
    description: "Play. Chill. Win. Together.",
    url: "/",
    siteName: "Fun Together",
    images: [
      {
        url: "/metalogo.png",
        width: 1200,
        height: 630,
        alt: "Fun Together – Play classic games with friends online",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fun Together",
    description: "Play. Chill. Win. Together.",
    images: ["/metalogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="relative min-h-screen">
          {children}
          <AppFooter />
        </div>
      </body>
    </html>
  );
}
