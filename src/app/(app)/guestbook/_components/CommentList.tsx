"use client";

import { CommentItem } from "./CommentItem";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { LoadSkeleton } from "./LoadSkeleton";
import { signIn, useSession } from "@/lib/auth-client";
import { api } from "@/trpc/react";

export default function CommentList() {
  const { ref, inView } = useInView();
  const { data: authData, isPending: loadingAuth } = useSession();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: loadingData,
  } = api.guestbook.list.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    },
  );

  const handleSignIn = async () => {
    await signIn.social({ provider: "google", callbackURL: "/guestbook" });
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const comments = data?.pages.flatMap((page) => page.items);

  return (
    <div className="flex flex-col gap-4">
      {!loadingAuth && !authData?.session ? (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 p-3">
          <p className="text-center text-zinc-400">
            Please{" "}
            <Button
              variant="link"
              className="dark:text-foreground m-0 p-0 font-medium text-[initial] text-zinc-100"
              onClick={handleSignIn}
            >
              sign in
            </Button>{" "}
            to leave a comment
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {!loadingData ? (
          comments?.length ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))
          ) : (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              No comments yet
            </p>
          )
        ) : (
          <LoadSkeleton />
        )}
      </div>

      <div ref={ref} className="h-10">
        {isFetchingNextPage && (
          <p className="text-center dark:text-zinc-400">Loading more...</p>
        )}
      </div>
    </div>
  );
}
