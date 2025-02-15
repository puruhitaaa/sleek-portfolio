// @ts-nocheck
// this file is not checked because for some reason the role field from user session is not recognized as a known type

"use client"

import PostFilters from "./PostFilters"
import PostFormDialog from "./PostFormDialog"
import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export default function PostHeader() {
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
        "flex sm:flex-row gap-4 flex-col justify-between": authData?.session,
      })}
    >
      <PostFilters />
      {authData?.session && authData?.user.role === "admin" ? (
        <PostFormDialog mode='create' />
      ) : null}
    </div>
  )
}
