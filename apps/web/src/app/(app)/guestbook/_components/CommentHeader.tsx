"use client";

import { useQuery } from "@tanstack/react-query";
import CommentFormDialog from "./CommentFormDialog";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

function CommentHeader() {
  const { data: authData } = useSession();

  return (
    <div
      className={cn({
        "flex items-center justify-between": authData?.session,
      })}
    >
      <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
        Guestbook ~
      </h1>
      {authData?.session ? <CommentFormDialog /> : null}
    </div>
  );
}

export default CommentHeader;
