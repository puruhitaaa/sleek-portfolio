"use client"

import { CommentItem } from "./CommentItem"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { client } from "@/lib/client"
import { LoadSkeleton } from "./LoadSkeleton"
import { authClient } from "@/lib/auth-client"

export default function CommentList() {
  const { ref, inView } = useInView()
  const { data: authData, isPending: loadingAuth } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  const {
    data,
    fetchNextPage,
    isPending: loadingData,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["comments"],
    queryFn: async ({
      pageParam = undefined,
    }: {
      pageParam: number | undefined
    }) => {
      const res = await client.comments.list.$get({
        cursor: pageParam,
        limit: 10,
      })
      return res.json()
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.NEXT_PUBLIC_FRONTEND_API_URL_PRODUCTION}/guestbook`
          : `${process.env.NEXT_PUBLIC_FRONTEND_API_URL_DEVELOPMENT}/guestbook`,
    })
  }

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  const comments = data?.pages.flatMap((page) => page.items)

  return (
    <div className='flex flex-col gap-4'>
      {!loadingAuth && !authData?.session ? (
        <div className='bg-stone-900/80 w-full h-full rounded-lg flex items-center justify-center p-3 border border-stone-800'>
          <p className='text-center text-zinc-400'>
            Please{" "}
            <Button
              variant='link'
              className='p-0 m-0 text-[initial] font-medium dark:text-foreground text-zinc-100'
              onClick={handleSignIn}
            >
              sign in
            </Button>{" "}
            to leave a comment
          </p>
        </div>
      ) : null}

      <div className='space-y-4'>
        {!loadingData ? (
          comments?.length ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))
          ) : (
            <p className='text-center dark:text-zinc-400 text-zinc-600'>
              No comments yet
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
    </div>
  )
}
