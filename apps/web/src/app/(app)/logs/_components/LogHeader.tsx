"use client";

import { cn } from "@/lib/utils";
import LogFormDialog from "./LogFormDialog";
import LogFilters from "./LogFilters";
import { useSession } from "@/lib/auth-client";

export default function LogHeader() {
  const { data: authData } = useSession();

  return (
    <div
      className={cn({
        "flex flex-col justify-between gap-4 sm:flex-row": authData?.session,
      })}
    >
      <LogFilters />
      {authData?.session && authData?.user.role === "admin" ? (
        <LogFormDialog mode="create" />
      ) : null}
    </div>
  );
}
