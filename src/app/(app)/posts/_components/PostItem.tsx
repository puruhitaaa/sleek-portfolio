import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, type RouterOutput } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PostFormDialog from "./PostFormDialog";
import { Pencil, Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";

type PostItemProps = RouterOutput["post"]["list"]["items"][number];

export function PostItem(post: PostItemProps) {
  const { id, title, createdAt } = post;
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

  const handleDeletePost = async () => {
    await deleteMutation.mutateAsync({ id });
  };

  return (
    <Card className="group rounded-lg border-stone-800/90 bg-stone-900/80 transition-colors">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="dark:text-foreground font-medium text-zinc-100">
            {title}
          </h3>
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
                    <MoreHorizontal className="dark:text-foreground h-4 w-4 text-zinc-100" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 border-stone-800 bg-stone-900">
                  <div className="flex flex-col space-y-3">
                    <PostFormDialog
                      mode="edit"
                      post={post}
                      trigger={
                        <Button className="text-foreground grid w-full grid-cols-3 bg-yellow-700 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-100">
                          <Pencil className="dark:text-foreground h-4 w-4 text-zinc-100" />
                          <span className="dark:text-foreground col-span-2 text-zinc-100">
                            Update
                          </span>
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      className="text-foreground grid w-full grid-cols-3 bg-red-700 text-zinc-400 hover:bg-red-500 hover:text-zinc-100"
                      onClick={handleDeletePost}
                    >
                      <Trash className="dark:text-foreground h-4 w-4 text-zinc-100" />
                      <span className="dark:text-foreground col-span-2 text-zinc-100">
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
