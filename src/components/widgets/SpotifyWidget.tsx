"use client";

import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

function SpotifyWidget() {
  const { data: spotifyData, isLoading: loadingData } =
    api.spotify.nowPlaying.useQuery();

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-stone-800/90 bg-stone-900/80 p-3 sm:flex-row sm:justify-between sm:gap-[initial]">
      {loadingData ? (
        <>
          <div className="flex flex-col justify-between gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>

          <Skeleton className="h-20 w-20" />
        </>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-2">
            <p
              className={cn("text-sm text-zinc-400 dark:text-zinc-600", {
                "!text-green-500": spotifyData?.isPlaying,
              })}
            >
              {spotifyData?.isPlaying ? "Now Playing" : "Last Played"}
            </p>
            <h2 className="font-medium">
              {spotifyData?.artistName} - {spotifyData?.songName}
            </h2>
          </div>
          {spotifyData?.imageURL ? (
            <Image
              src={spotifyData?.imageURL}
              alt="Spotify"
              className="h-20 w-20 rounded-lg grayscale transition-all duration-300 group-hover:grayscale-0"
              width={500}
              height={500}
            />
          ) : (
            <Skeleton className="h-20 w-20" />
          )}
        </>
      )}
    </div>
  );
}

export default SpotifyWidget;
