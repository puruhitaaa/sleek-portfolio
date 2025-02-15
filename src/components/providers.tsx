"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { PropsWithChildren } from "react";
import { TRPCReactProvider } from "@/trpc/react";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
};
