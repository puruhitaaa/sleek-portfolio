// @ts-nocheck
// this file is not checked because for some reason the role field from user session is not recognized as a known type

"use client";

import { useSession } from "@/lib/auth-client";
import ProjectFilters from "./ProjectFilters";
import ProjectFormDialog from "./ProjectFormDialog";
import { cn } from "@/lib/utils";

export default function ProjectHeader() {
  const { data: authData } = useSession();

  return (
    <div
      className={cn({
        "flex flex-col justify-between gap-4 sm:flex-row": authData?.session,
      })}
    >
      <ProjectFilters />
      {authData?.session && authData?.user.role === "admin" ? (
        <ProjectFormDialog mode="create" />
      ) : null}
    </div>
  );
}
