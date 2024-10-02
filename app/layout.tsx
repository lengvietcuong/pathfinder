import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const robotomono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-robotomono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Pathfinding Visualizer",
  description: "Visualize the magic behind pathfinding algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotomono.variable} dark grid place-items-center h-svh`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
