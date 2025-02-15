"use client";

import { PostItem } from "./PostItem";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useQueryState } from "nuqs";
import { LoadSkeleton } from "./LoadSkeleton";
import { api } from "@/trpc/react";

export default function PostList() {
  const { ref, inView } = useInView();
  const [sort] = useQueryState("sort");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    api.post.list.useInfiniteQuery(
      {
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      },
      {
        initialCursor: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const posts = data?.pages.flatMap((page) => page.items);

  return (
    <>
      <div className="space-y-4">
        {!isPending ? (
          posts?.length ? (
            posts.map((post) => <PostItem key={post.id} {...post} />)
          ) : (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              No posts yet
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
    </>
  );
}
