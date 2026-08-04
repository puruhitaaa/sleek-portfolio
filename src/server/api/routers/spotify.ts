import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";

export const spotifyRouter = createTRPCRouter({
  nowPlaying: publicProcedure.query(async () => {
    const resp = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${env.NEXT_PUBLIC_LASTFM_USERNAME}&api_key=${env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json&limit=2`,

      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    const response = (await resp.json()) as {
      recenttracks: {
        track: Array<{
          name: string;
          artist: { "#text": string };
          url: string;
          image: Array<{ "#text": string }>;
          "@attr"?: { nowplaying: string };
        }>;
      };
    };

    const tracks = response?.recenttracks?.track;
    const song = Array.isArray(tracks) ? tracks[0] : undefined;

    if (!song) {
      return {
        isPlaying: false,
        songName: undefined,
        artistName: undefined,
        songURL: undefined,
        imageURL: undefined,
      };
    }

    const data = {
      isPlaying: song["@attr"]?.nowplaying === "true",
      songName: song.name,
      artistName: song.artist["#text"],
      songURL: song.url,
      imageURL: song.image[3]?.["#text"],
    };

    return data;
  }),
});
