"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { PropsWithChildren } from "react";
import { ReactQueryProvider } from "@/components/query-provider";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NuqsAdapter>
      <ReactQueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </NuqsAdapter>
  );
};
