import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, type RouterOutput } from "@/lib/utils";
import Image from "next/image";
import { useQueryState } from "nuqs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Pin, Trash } from "lucide-react";
import { toast } from "sonner";
import ProjectFormDialog from "./ProjectFormDialog";
import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/react";

type ProjectItemProps = RouterOutput["project"]["list"]["items"][number];

export function ProjectItem(project: ProjectItemProps) {
  const {
    name,
    description,
    image,
    websiteLink,
    githubLink,
    youtubeLink,
    createdAt,
    isPinned,
  } = project;
  const [sort] = useQueryState("sort");

  const utils = api.useUtils();

  const { data: authData } = useSession();

  const deleteMutation = api.project.delete.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Deleting project...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Project deleted successfully");

      utils.project.list.invalidate({
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to delete project");
    },
  });

  const togglePinMutation = api.project.togglePin.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading(
        `${isPinned ? "Unpinning" : "Pinning"} project...`,
      );
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success(`Project ${isPinned ? "unpinned" : "pinned"} successfully`);

      utils.project.list.invalidate({
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error(`Failed to ${isPinned ? "unpin" : "pin"} project`);
    },
  });

  const handleDeleteProject = async () => {
    await deleteMutation.mutateAsync({ id: project.id, imageUrl: image });
  };

  const handleTogglePin = async () => {
    await togglePinMutation.mutateAsync({ id: project.id });
  };

  return (
    <Card className="group rounded-lg border-stone-800/90 bg-stone-900/80">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-zinc-100 dark:text-foreground">
              {name}
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
                    <ProjectFormDialog
                      mode="edit"
                      project={project}
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
                      onClick={handleDeleteProject}
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
      <CardContent className="space-y-4">
        <Image
          src={image}
          alt={name}
          width={800}
          height={400}
          className="max-h-[20rem] w-full rounded-lg object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
        />
        <p className="truncate text-zinc-300 dark:text-zinc-400">
          {description}
        </p>
        <div className="flex gap-4">
          {websiteLink ? (
            <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 dark:text-zinc-600"
            >
              Website
            </a>
          ) : null}
          {githubLink ? (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 dark:text-zinc-600"
            >
              GitHub
            </a>
          ) : null}
          {youtubeLink ? (
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 dark:text-zinc-600"
            >
              YouTube
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
