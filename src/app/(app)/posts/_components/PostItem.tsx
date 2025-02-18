import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, type RouterOutput } from "@/lib/utils";
import { MoreHorizontal, Pencil, Pin, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PostFormDialog from "./PostFormDialog";
import { useQueryState } from "nuqs";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";

type PostItemProps = RouterOutput["post"]["list"]["items"][number];

export function PostItem(post: PostItemProps) {
  const { id, title, createdAt, isPinned } = post;
  const [sort] = useQueryState("sort");

  const utils = api.useUtils();

  const { data: authData } = useSession();

  const deleteMutation = api.post.delete.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Deleting post...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Post deleted successfully");

      utils.post.list.invalidate({
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to delete post");
    },
  });

  const togglePinMutation = api.post.togglePin.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading(
        `${isPinned ? "Unpinning" : "Pinning"} post...`,
      );
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success(`Post ${isPinned ? "unpinned" : "pinned"} successfully`);

      utils.post.list.invalidate({
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error(`Failed to ${isPinned ? "unpin" : "pin"} post`);
    },
  });

  const handleDeletePost = async () => {
    await deleteMutation.mutateAsync({ id });
  };

  const handleTogglePin = async () => {
    await togglePinMutation.mutateAsync({ id });
  };

  return (
    <Card className="group rounded-lg border-stone-800/90 bg-stone-900/80 transition-colors">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-zinc-100 dark:text-foreground">
              {title}
            </h3>
            {isPinned && (
              <Pin className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          <div
            className={cn({
              "flex items-center gap-3": authData?.session,
            })}
          >
            <time className="text-sm text-zinc-400 dark:text-zinc-500">
              {format(createdAt, "MMM d, yyyy")}
            </time>
            {authData?.session ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-zinc-100 dark:text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 border-stone-800 bg-stone-900">
                  <div className="flex flex-col space-y-3">
                    <Button
                      variant="ghost"
                      className={cn(
                        "grid w-full grid-cols-3 text-foreground text-zinc-400 hover:text-zinc-100",
                        isPinned
                          ? "bg-yellow-700 hover:bg-yellow-500"
                          : "bg-blue-700 hover:bg-blue-500",
                      )}
                      onClick={handleTogglePin}
                    >
                      <Pin
                        className={cn(
                          "h-4 w-4 text-zinc-100 dark:text-foreground",
                          isPinned && "fill-current",
                        )}
                      />
                      <span className="col-span-2 text-zinc-100 dark:text-foreground">
                        {isPinned ? "Unpin" : "Pin"}
                      </span>
                    </Button>
                    <PostFormDialog
                      mode="edit"
                      post={post}
                      trigger={
                        <Button className="grid w-full grid-cols-3 bg-yellow-700 text-foreground text-zinc-400 hover:bg-yellow-500 hover:text-zinc-100">
                          <Pencil className="h-4 w-4 text-zinc-100 dark:text-foreground" />
                          <span className="col-span-2 text-zinc-100 dark:text-foreground">
                            Update
                          </span>
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      className="grid w-full grid-cols-3 bg-red-700 text-foreground text-zinc-400 hover:bg-red-500 hover:text-zinc-100"
                      onClick={handleDeletePost}
                    >
                      <Trash className="h-4 w-4 text-zinc-100 dark:text-foreground" />
                      <span className="col-span-2 text-zinc-100 dark:text-foreground">
                        Delete
                      </span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link
            className="border-input bg-stone-900/80 text-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            href={`/posts/${id}`}
          >
            View Post
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
