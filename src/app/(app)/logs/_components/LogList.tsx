"use client";

import { LogItem } from "./LogItem";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useQueryState } from "nuqs";
import { LoadSkeleton } from "./LoadSkeleton";
import { api } from "@/trpc/react";

function LogList() {
  const { ref, inView } = useInView();
  const [category] = useQueryState("category");
  const [sort] = useQueryState("sort");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    api.logs.list.useInfiniteQuery(
      {
        limit: 10,
        category: category ?? undefined,
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

  const logs = data?.pages.flatMap((page) => page.items);

  return (
    <>
      <div className="space-y-4">
        {!isPending ? (
          logs?.length ? (
            logs.map((log) => <LogItem key={log.id} log={log} />)
          ) : (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              No logs yet
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

export default LogList;
