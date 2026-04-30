"use client";

import {
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { createRpcClient, createRpcQueryUtils } from "@baiqueee/rpc";
import type { RouterInputs as RpcRouterInputs, RouterOutputs as RpcRouterOutputs } from "@baiqueee/rpc";

import { apiBaseUrl } from "@/lib/api-base-url";
import { createQueryClient } from "./query-client";

const client = createRpcClient(apiBaseUrl);
const orpc = createRpcQueryUtils(client);

type Cursor = string | undefined;
type LegacyInfiniteQueryOptions<TPage, TPageParam extends Cursor = Cursor> = Omit<
  UseInfiniteQueryOptions<
    TPage,
    Error,
    InfiniteData<TPage, TPageParam>,
    QueryKey,
    TPageParam
  >,
  "queryKey" | "queryFn" | "initialPageParam"
> & {
  initialCursor?: TPageParam;
};

type PostDetailInput = RpcRouterInputs["post"]["detail"];
type PostDetailOutput = RpcRouterOutputs["post"]["detail"];
type PostListInput = RpcRouterInputs["post"]["list"];
type PostListOutput = RpcRouterOutputs["post"]["list"];
type PostCreateInput = RpcRouterInputs["post"]["create"];
type PostCreateOutput = RpcRouterOutputs["post"]["create"];
type PostUpdateInput = RpcRouterInputs["post"]["update"];
type PostUpdateOutput = RpcRouterOutputs["post"]["update"];
type PostDeleteInput = RpcRouterInputs["post"]["delete"];
type PostDeleteOutput = RpcRouterOutputs["post"]["delete"];
type PostTogglePinInput = RpcRouterInputs["post"]["togglePin"];
type PostTogglePinOutput = RpcRouterOutputs["post"]["togglePin"];

type ProjectListInput = RpcRouterInputs["project"]["list"];
type ProjectListOutput = RpcRouterOutputs["project"]["list"];
type ProjectCreateInput = RpcRouterInputs["project"]["create"];
type ProjectCreateOutput = RpcRouterOutputs["project"]["create"];
type ProjectUpdateInput = RpcRouterInputs["project"]["update"];
type ProjectUpdateOutput = RpcRouterOutputs["project"]["update"];
type ProjectDeleteInput = RpcRouterInputs["project"]["delete"];
type ProjectDeleteOutput = RpcRouterOutputs["project"]["delete"];
type ProjectTogglePinInput = RpcRouterInputs["project"]["togglePin"];
type ProjectTogglePinOutput = RpcRouterOutputs["project"]["togglePin"];

type LogListInput = RpcRouterInputs["logs"]["list"];
type LogListOutput = RpcRouterOutputs["logs"]["list"];
type LogCreateInput = RpcRouterInputs["logs"]["create"];
type LogCreateOutput = RpcRouterOutputs["logs"]["create"];
type LogUpdateInput = RpcRouterInputs["logs"]["update"];
type LogUpdateOutput = RpcRouterOutputs["logs"]["update"];
type LogDeleteInput = RpcRouterInputs["logs"]["delete"];
type LogDeleteOutput = RpcRouterOutputs["logs"]["delete"];

type GuestbookListInput = RpcRouterInputs["guestbook"]["list"];
type GuestbookListOutput = RpcRouterOutputs["guestbook"]["list"];
type GuestbookCreateInput = RpcRouterInputs["guestbook"]["create"];
type GuestbookCreateOutput = RpcRouterOutputs["guestbook"]["create"];
type GuestbookUpdateInput = RpcRouterInputs["guestbook"]["update"];
type GuestbookUpdateOutput = RpcRouterOutputs["guestbook"]["update"];
type GuestbookDeleteInput = RpcRouterInputs["guestbook"]["delete"];
type GuestbookDeleteOutput = RpcRouterOutputs["guestbook"]["delete"];

type CloudinaryUploadInput = RpcRouterInputs["cloudinary"]["uploadImage"];
type CloudinaryUploadOutput = RpcRouterOutputs["cloudinary"]["uploadImage"];
type CloudinaryDeleteInput = RpcRouterInputs["cloudinary"]["deleteImage"];
type CloudinaryDeleteOutput = RpcRouterOutputs["cloudinary"]["deleteImage"];

type SpotifyNowPlayingOutput = RpcRouterOutputs["spotify"]["nowPlaying"];

function buildQuery<TInput, TOutput>(
  queryOptionsFactory: (options: any) => unknown,
  input: TInput | undefined,
  options?: UseQueryOptions<TOutput, Error, TOutput, QueryKey>,
): UseQueryResult<TOutput, Error> {
  const queryOptions =
    input === undefined ? (options ?? {}) : { input, ...(options ?? {}) };

  return useQuery(queryOptionsFactory(queryOptions as any) as any) as UseQueryResult<
    TOutput,
    Error
  >;
}

function buildInfiniteQuery<
  TInput extends { cursor?: TPageParam },
  TPage,
  TPageParam extends Cursor = Cursor,
>(
  infiniteOptionsFactory: (options: any) => unknown,
  input: TInput,
  options?: LegacyInfiniteQueryOptions<TPage, TPageParam>,
): UseInfiniteQueryResult<InfiniteData<TPage, TPageParam>, Error> {
  const { initialCursor, ...rest } = options ?? {};

  return useInfiniteQuery(
    infiniteOptionsFactory({
      input: (pageParam: TPageParam | undefined) =>
        pageParam === undefined ? input : { ...input, cursor: pageParam },
      initialPageParam: initialCursor,
      ...rest,
    } as any) as any,
  ) as UseInfiniteQueryResult<InfiniteData<TPage, TPageParam>, Error>;
}

function buildMutation<TVariables, TData, TContext = unknown>(
  mutationOptionsFactory: (options: any) => unknown,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>,
): UseMutationResult<TData, Error, TVariables, TContext> {
  return useMutation(mutationOptionsFactory(options ?? {}) as any) as UseMutationResult<
    TData,
    Error,
    TVariables,
    TContext
  >;
}

function useLegacyUtils() {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      post: {
        list: {
          invalidate: async (_input?: PostListInput) => {
            await queryClient.invalidateQueries({ queryKey: orpc.post.list.key() });
          },
        },
      },
      project: {
        list: {
          invalidate: async (_input?: ProjectListInput) => {
            await queryClient.invalidateQueries({
              queryKey: orpc.project.list.key(),
            });
          },
        },
      },
      logs: {
        list: {
          invalidate: async (_input?: LogListInput) => {
            await queryClient.invalidateQueries({
              queryKey: orpc.logs.list.key(),
            });
          },
        },
      },
      guestbook: {
        list: {
          invalidate: async (_input?: GuestbookListInput) => {
            await queryClient.invalidateQueries({
              queryKey: orpc.guestbook.list.key(),
            });
          },
        },
      },
    }),
    [queryClient],
  );
}

const usePostDetailQuery = (
  input: PostDetailInput,
  options?: UseQueryOptions<PostDetailOutput, Error, PostDetailOutput, QueryKey>,
) => buildQuery<PostDetailInput, PostDetailOutput>(orpc.post.detail.queryOptions, input, options);

const usePostListInfiniteQuery = (
  input: PostListInput,
  options?: LegacyInfiniteQueryOptions<PostListOutput, Cursor>,
) =>
  buildInfiniteQuery<PostListInput, PostListOutput>(orpc.post.list.infiniteOptions, input, options);

const usePostCreateMutation = <TContext = unknown>(
  options?: UseMutationOptions<PostCreateOutput, Error, PostCreateInput, TContext>,
) => buildMutation<PostCreateInput, PostCreateOutput, TContext>(orpc.post.create.mutationOptions, options);

const usePostUpdateMutation = <TContext = unknown>(
  options?: UseMutationOptions<PostUpdateOutput, Error, PostUpdateInput, TContext>,
) => buildMutation<PostUpdateInput, PostUpdateOutput, TContext>(orpc.post.update.mutationOptions, options);

const usePostDeleteMutation = <TContext = unknown>(
  options?: UseMutationOptions<PostDeleteOutput, Error, PostDeleteInput, TContext>,
) => buildMutation<PostDeleteInput, PostDeleteOutput, TContext>(orpc.post.delete.mutationOptions, options);

const usePostTogglePinMutation = <TContext = unknown>(
  options?: UseMutationOptions<PostTogglePinOutput, Error, PostTogglePinInput, TContext>,
) =>
  buildMutation<PostTogglePinInput, PostTogglePinOutput, TContext>(
    orpc.post.togglePin.mutationOptions,
    options,
  );

const useProjectListInfiniteQuery = (
  input: ProjectListInput,
  options?: LegacyInfiniteQueryOptions<ProjectListOutput, Cursor>,
) =>
  buildInfiniteQuery<ProjectListInput, ProjectListOutput>(
    orpc.project.list.infiniteOptions,
    input,
    options,
  );

const useProjectCreateMutation = <TContext = unknown>(
  options?: UseMutationOptions<ProjectCreateOutput, Error, ProjectCreateInput, TContext>,
) =>
  buildMutation<ProjectCreateInput, ProjectCreateOutput, TContext>(
    orpc.project.create.mutationOptions,
    options,
  );

const useProjectUpdateMutation = <TContext = unknown>(
  options?: UseMutationOptions<ProjectUpdateOutput, Error, ProjectUpdateInput, TContext>,
) =>
  buildMutation<ProjectUpdateInput, ProjectUpdateOutput, TContext>(
    orpc.project.update.mutationOptions,
    options,
  );

const useProjectDeleteMutation = <TContext = unknown>(
  options?: UseMutationOptions<ProjectDeleteOutput, Error, ProjectDeleteInput, TContext>,
) =>
  buildMutation<ProjectDeleteInput, ProjectDeleteOutput, TContext>(
    orpc.project.delete.mutationOptions,
    options,
  );

const useProjectTogglePinMutation = <TContext = unknown>(
  options?: UseMutationOptions<ProjectTogglePinOutput, Error, ProjectTogglePinInput, TContext>,
) =>
  buildMutation<ProjectTogglePinInput, ProjectTogglePinOutput, TContext>(
    orpc.project.togglePin.mutationOptions,
    options,
  );

const useLogsListInfiniteQuery = (
  input: LogListInput,
  options?: LegacyInfiniteQueryOptions<LogListOutput, Cursor>,
) =>
  buildInfiniteQuery<LogListInput, LogListOutput>(orpc.logs.list.infiniteOptions, input, options);

const useLogsCreateMutation = <TContext = unknown>(
  options?: UseMutationOptions<LogCreateOutput, Error, LogCreateInput, TContext>,
) => buildMutation<LogCreateInput, LogCreateOutput, TContext>(orpc.logs.create.mutationOptions, options);

const useLogsUpdateMutation = <TContext = unknown>(
  options?: UseMutationOptions<LogUpdateOutput, Error, LogUpdateInput, TContext>,
) => buildMutation<LogUpdateInput, LogUpdateOutput, TContext>(orpc.logs.update.mutationOptions, options);

const useLogsDeleteMutation = <TContext = unknown>(
  options?: UseMutationOptions<LogDeleteOutput, Error, LogDeleteInput, TContext>,
) => buildMutation<LogDeleteInput, LogDeleteOutput, TContext>(orpc.logs.delete.mutationOptions, options);

const useGuestbookListInfiniteQuery = (
  input: GuestbookListInput,
  options?: LegacyInfiniteQueryOptions<GuestbookListOutput, Cursor>,
) =>
  buildInfiniteQuery<GuestbookListInput, GuestbookListOutput>(
    orpc.guestbook.list.infiniteOptions,
    input,
    options,
  );

const useGuestbookCreateMutation = <TContext = unknown>(
  options?: UseMutationOptions<GuestbookCreateOutput, Error, GuestbookCreateInput, TContext>,
) =>
  buildMutation<GuestbookCreateInput, GuestbookCreateOutput, TContext>(
    orpc.guestbook.create.mutationOptions,
    options,
  );

const useGuestbookUpdateMutation = <TContext = unknown>(
  options?: UseMutationOptions<GuestbookUpdateOutput, Error, GuestbookUpdateInput, TContext>,
) =>
  buildMutation<GuestbookUpdateInput, GuestbookUpdateOutput, TContext>(
    orpc.guestbook.update.mutationOptions,
    options,
  );

const useGuestbookDeleteMutation = <TContext = unknown>(
  options?: UseMutationOptions<GuestbookDeleteOutput, Error, GuestbookDeleteInput, TContext>,
) =>
  buildMutation<GuestbookDeleteInput, GuestbookDeleteOutput, TContext>(
    orpc.guestbook.delete.mutationOptions,
    options,
  );

const useCloudinaryUploadImageMutation = <TContext = unknown>(
  options?: UseMutationOptions<CloudinaryUploadOutput, Error, CloudinaryUploadInput, TContext>,
) =>
  buildMutation<CloudinaryUploadInput, CloudinaryUploadOutput, TContext>(
    orpc.cloudinary.uploadImage.mutationOptions,
    options,
  );

const useCloudinaryDeleteImageMutation = <TContext = unknown>(
  options?: UseMutationOptions<CloudinaryDeleteOutput, Error, CloudinaryDeleteInput, TContext>,
) =>
  buildMutation<CloudinaryDeleteInput, CloudinaryDeleteOutput, TContext>(
    orpc.cloudinary.deleteImage.mutationOptions,
    options,
  );

const useSpotifyNowPlayingQuery = (
  options?: UseQueryOptions<SpotifyNowPlayingOutput, Error, SpotifyNowPlayingOutput, QueryKey>,
) =>
  buildQuery<undefined, SpotifyNowPlayingOutput>(
    orpc.spotify.nowPlaying.queryOptions,
    undefined,
    options,
  );

const api = {
  post: {
    detail: {
      useQuery: usePostDetailQuery,
    },
    list: {
      useInfiniteQuery: usePostListInfiniteQuery,
    },
    create: {
      useMutation: usePostCreateMutation,
    },
    update: {
      useMutation: usePostUpdateMutation,
    },
    delete: {
      useMutation: usePostDeleteMutation,
    },
    togglePin: {
      useMutation: usePostTogglePinMutation,
    },
  },
  project: {
    list: {
      useInfiniteQuery: useProjectListInfiniteQuery,
    },
    create: {
      useMutation: useProjectCreateMutation,
    },
    update: {
      useMutation: useProjectUpdateMutation,
    },
    delete: {
      useMutation: useProjectDeleteMutation,
    },
    togglePin: {
      useMutation: useProjectTogglePinMutation,
    },
  },
  logs: {
    list: {
      useInfiniteQuery: useLogsListInfiniteQuery,
    },
    create: {
      useMutation: useLogsCreateMutation,
    },
    update: {
      useMutation: useLogsUpdateMutation,
    },
    delete: {
      useMutation: useLogsDeleteMutation,
    },
  },
  guestbook: {
    list: {
      useInfiniteQuery: useGuestbookListInfiniteQuery,
    },
    create: {
      useMutation: useGuestbookCreateMutation,
    },
    update: {
      useMutation: useGuestbookUpdateMutation,
    },
    delete: {
      useMutation: useGuestbookDeleteMutation,
    },
  },
  cloudinary: {
    uploadImage: {
      useMutation: useCloudinaryUploadImageMutation,
    },
    deleteImage: {
      useMutation: useCloudinaryDeleteImageMutation,
    },
  },
  spotify: {
    nowPlaying: {
      useQuery: useSpotifyNowPlayingQuery,
    },
  },
  useUtils: useLegacyUtils,
} as const;

export { api };

export type RouterInputs = RpcRouterInputs;
export type RouterOutputs = RpcRouterOutputs;

export function ORPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
