// @ts-nocheck
// this file is not checked because for some reason the role field from user session is not recognized as a known type

"use client";

import PostFilters from "./PostFilters";
import PostFormDialog from "./PostFormDialog";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export default function PostHeader() {
  const { data: authData } = useSession();

  return (
    <div
      className={cn({
        "flex flex-col justify-between gap-4 sm:flex-row": authData?.session,
      })}
    >
      <PostFilters />
      {authData?.session && authData?.user.role === "admin" ? (
        <PostFormDialog mode="create" />
      ) : null}
    </div>
  );
}
