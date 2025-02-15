import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, type RouterOutput } from "@/lib/utils";
import LogFormDialog from "./LogFormDialog";
import { useQueryState } from "nuqs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/react";

type LogItemProps = {
  log: RouterOutput["logs"]["list"]["items"][number];
};

export function LogItem({ log }: LogItemProps) {
  const { title, content, createdAt } = log;
  const [category] = useQueryState("category");
  const [sort] = useQueryState("sort");
  const utils = api.useUtils();

  const { data: authData } = useSession();

  const deleteMutation = api.logs.delete.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Deleting log...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Log deleted successfully");

      utils.logs.list.invalidate({
        limit: 10,
        category: category ?? undefined,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to delete log");
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: log.id });
  };

  return (
    <Card className="rounded-lg border-stone-800/90 bg-stone-900/80">
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-zinc-400 dark:text-zinc-600">
            {log.category}
          </span>
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
                    <LogFormDialog
                      mode="edit"
                      log={log}
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
                      onClick={handleDelete}
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
        <h3 className="dark:text-foreground font-medium text-zinc-100">
          {title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-300 dark:text-zinc-400">{content}</p>
      </CardContent>
    </Card>
  );
}
