import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/site";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Baiq Personal Site",
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", fontSans.className)}>
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
