"use client";

import { LogItem } from "./LogItem";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useQueryState } from "nuqs";
import { LoadSkeleton } from "./LoadSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";

function LogList() {
  const { ref, inView } = useInView();
  const [category] = useQueryState("category");
  const [sort] = useQueryState("sort");

  const currentSort = (sort === "oldest" ? "oldest" : "newest") as "newest" | "oldest";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["logs", "list", { category: category ?? undefined, sort: currentSort }],
      queryFn: async ({ pageParam }) => {
        const { data, error } = await api.logs.get({
          query: {
            limit: 10,
            cursor: pageParam,
            category: category ?? undefined,
            sort: currentSort,
          },
        });
        if (error) throw error;
        return data;
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    });

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
