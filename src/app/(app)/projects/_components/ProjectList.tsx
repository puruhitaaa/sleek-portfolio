"use client";

import { ProjectItem } from "./ProjectItem";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useQueryState } from "nuqs";
import { LoadSkeleton } from "./LoadSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";

export default function ProjectList() {
  const { ref, inView } = useInView();
  const [sort] = useQueryState("sort");

  const currentSort = (sort === "oldest" ? "oldest" : "newest") as "newest" | "oldest";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["projects", "list", { sort: currentSort }],
      queryFn: async ({ pageParam }) => {
        const { data, error } = await api.projects.get({
          query: {
            limit: 10,
            cursor: pageParam,
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

  const projects = data?.pages.flatMap((page) => page.items);

  return (
    <>
      <div className="space-y-4">
        {!isPending ? (
          projects?.length ? (
            projects.map((project) => (
              <ProjectItem key={project.id} {...project} />
            ))
          ) : (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              No projects yet
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
