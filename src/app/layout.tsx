import type { Metadata } from "next";
import { Providers } from "@/components/providers";

import "@/styles/globals.css";
import { siteConfig } from "@/site";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Baiq Personal Site",
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
