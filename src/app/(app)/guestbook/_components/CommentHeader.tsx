"use client"

import { useQuery } from "@tanstack/react-query"
import CommentFormDialog from "./CommentFormDialog"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

function CommentHeader() {
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  return (
    <div
      className={cn({
        "flex items-center justify-between": authData?.session,
      })}
    >
      <h1 className='text-xl font-medium dark:text-zinc-100 text-zinc-900'>
        Guestbook ~
      </h1>
      {authData?.session ? <CommentFormDialog /> : null}
    </div>
  )
}

export default CommentHeader
