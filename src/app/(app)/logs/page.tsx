import { type Metadata } from "next";
import LogList from "./_components/LogList";
import { siteConfig } from "@/site";
import LogHeader from "./_components/LogHeader";
import { Suspense } from "react";
import { LoadSkeleton } from "./_components/LoadSkeleton";

export const metadata: Metadata = {
  title: `Logs - ${siteConfig.name} Personal Site`,
  description: `${siteConfig.name}'s personal logs.`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
        Logs ~
      </h1>
      <Suspense fallback={<LoadSkeleton />}>
        <LogHeader />
        <LogList />
      </Suspense>
    </div>
  );
}
