import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import CommentFormDialog from "./CommentFormDialog";
import type { RouterOutput } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";

type CommentItemProps = RouterOutput["guestbook"]["list"]["items"][number];

export function CommentItem({
  id,
  content,
  createdAt,
  user,
}: CommentItemProps) {
  const { data: authData } = useSession();
  const utils = api.useUtils();

  const deleteMutation = api.guestbook.delete.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Deleting comment...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Comment deleted successfully");

      utils.guestbook.list.invalidate({ limit: 10 });
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to delete comment");
    },
  });

  const isOwner = authData?.session?.userId === user?.id;
  const isAdmin = authData?.user?.role === "admin";
  const canModify = isOwner || isAdmin;

  return (
    <Card className="rounded-lg border-stone-800/90 bg-stone-900/80">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-3">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={24}
              height={24}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-stone-800" />
          )}
          <div className="flex w-full items-center justify-between">
            <span className="dark:text-foreground text-sm font-medium text-zinc-100">
              {user?.name}
            </span>

            <div className="flex items-center gap-2">
              <time className="text-sm text-zinc-400 dark:text-zinc-500">
                {format(createdAt, "MMM d, yyyy")}
              </time>
              {canModify ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="dark:text-foreground h-4 w-4 text-zinc-100" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 border-stone-800 bg-stone-900">
                    <div className="flex flex-col space-y-3">
                      {isOwner && (
                        <CommentFormDialog
                          mode="edit"
                          comment={{ id, content }}
                          trigger={
                            <Button className="text-foreground grid w-full grid-cols-3 bg-yellow-700 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-100">
                              <Pencil className="dark:text-foreground h-4 w-4 text-zinc-100" />
                              <span className="dark:text-foreground col-span-2 text-zinc-100">
                                Update
                              </span>
                            </Button>
                          }
                        />
                      )}
                      <Button
                        variant="ghost"
                        className="text-foreground grid w-full grid-cols-3 bg-red-700 text-zinc-400 hover:bg-red-500 hover:text-zinc-100"
                        onClick={() => deleteMutation.mutate({ id })}
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
        </div>
        <p className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words text-zinc-300 dark:text-zinc-400">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
