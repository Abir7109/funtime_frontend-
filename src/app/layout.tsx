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
