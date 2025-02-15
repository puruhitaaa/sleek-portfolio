"use client"

import { LogItem } from "./LogItem"
import { client } from "@/lib/client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useQueryState } from "nuqs"
import { LoadSkeleton } from "./LoadSkeleton"

function LogList() {
  const { ref, inView } = useInView()
  const [category] = useQueryState("category")
  const [sort] = useQueryState("sort")

  const { data, fetchNextPage, isPending, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["logs", category, sort],
      queryFn: async ({
        pageParam = undefined,
      }: {
        pageParam: number | undefined
      }) => {
        const res = await client.logs.list.$get({
          cursor: pageParam,
          limit: 10,
          category: category ?? undefined,
          sort:
            (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
        })
        return res.json()
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  const logs = data?.pages.flatMap((page) => page.items)

  return (
    <>
      <div className='space-y-4'>
        {!isPending ? (
          logs?.length ? (
            logs.map((log) => <LogItem key={log.id} log={log} />)
          ) : (
            <p className='text-center dark:text-zinc-400 text-zinc-600'>
              No logs yet
            </p>
          )
        ) : (
          <LoadSkeleton />
        )}
      </div>

      <div ref={ref} className='h-10'>
        {isFetchingNextPage && (
          <p className='text-center dark:text-zinc-400'>Loading more...</p>
        )}
      </div>
    </>
  )
}

export default LogList
