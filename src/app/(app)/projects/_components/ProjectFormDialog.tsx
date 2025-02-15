"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import CustomImageUpload from "./CustomImageUploader";
import { api } from "@/trpc/react";
import type { RouterOutput } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL"),
  websiteLink: z.string().url("Must be a valid URL").nullish(),
  githubLink: z.string().url("Must be a valid URL").nullish(),
  youtubeLink: z.string().url("Must be a valid URL").nullish(),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormDialogProps {
  mode: "create" | "edit";
  project?: RouterOutput["project"]["list"]["items"][number];
  trigger?: React.ReactNode;
}

export default function ProjectFormDialog({
  mode,
  project,
  trigger,
}: ProjectFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [sort] = useQueryState("sort");

  const utils = api.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      image: project?.image ?? "",
      websiteLink: project?.websiteLink,
      githubLink: project?.githubLink,
      youtubeLink: project?.youtubeLink,
    },
  });
  const createMutation = api.project.create.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Creating project...", {
        duration: 1500,
      });
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading);
      toast.success("Project created successfully", {
        duration: 1500,
      });
      utils.project.list.invalidate({
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
      form.reset();
      setOpen(false);
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to create project", {
        duration: 1500,
      });
    },
  });

  const updateMutation = api.project.update.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Updating project...", {
        duration: 1500,
      });
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading);
      toast.success("Project updated successfully", {
        duration: 1500,
      });
      utils.project.list.invalidate({
        limit: 10,
        sort:
          (sort as "newest" | "oldest") ?? ("newest" as "newest" | "oldest"),
      });
      form.reset();
      setOpen(false);
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to update project", {
        duration: 1500,
      });
    },
  });

  async function onSubmit(values: FormData) {
    if (mode === "create") {
      await createMutation.mutateAsync(values);
    } else {
      await updateMutation.mutateAsync({
        id: project?.id!,
        ...values,
        imageUrl: values.image,
      });
    }
  }

  const defaultTrigger =
    mode === "create" ? (
      <Button
        className="text-zinc-900 hover:text-zinc-100 dark:text-zinc-100 dark:hover:text-zinc-900"
        size="icon"
        variant="outline"
      >
        <Plus />
      </Button>
    ) : (
      <Button
        className="text-zinc-900 hover:text-zinc-100 dark:text-zinc-100 dark:hover:text-zinc-900"
        variant="ghost"
        size="icon"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-[425px] dark:border-stone-800/90 dark:bg-stone-900">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write project description..."
                      className="max-h-72 min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <CustomImageUpload
                      image={field.value}
                      onUpload={(url) => field.onChange(url)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="websiteLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter website URL"
                      {...field}
                      value={field.value!}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter GitHub URL"
                      {...field}
                      value={field.value!}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtubeLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter YouTube URL"
                      {...field}
                      value={field.value!}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                form.formState.isSubmitting
              }
              type="submit"
              className="dark:text-foreground w-full text-zinc-100"
            >
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
