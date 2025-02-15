"use client"

import { PostItem } from "./PostItem"
import { client } from "@/lib/client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useQueryState } from "nuqs"
import { LoadSkeleton } from "./LoadSkeleton"

export default function PostList() {
  const { ref, inView } = useInView()
  const [sort] = useQueryState("sort")

  const { data, fetchNextPage, isPending, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", sort],
      queryFn: async ({
        pageParam = undefined,
      }: {
        pageParam: number | undefined
      }) => {
        const res = await client.posts.list.$get({
          cursor: pageParam,
          limit: 10,
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

  const posts = data?.pages.flatMap((page) => page.items)

  return (
    <>
      <div className='space-y-4'>
        {!isPending ? (
          posts?.length ? (
            posts.map((post) => <PostItem key={post.id} {...post} />)
          ) : (
            <p className='text-center dark:text-zinc-400 text-zinc-600'>
              No posts yet
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
