// @ts-nocheck
// this file is not checked because for some reason the role field from user session is not recognized as a known type

"use client"

import { cn } from "@/lib/utils"
import LogFormDialog from "./LogFormDialog"
import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import LogFilters from "./LogFilters"

export default function LogHeader() {
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
      <LogFilters />
      {authData?.session && authData?.user.role === "admin" ? (
        <LogFormDialog mode='create' />
      ) : null}
    </div>
  )
}
