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
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof formSchema>;

interface PostItemData {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean | null;
  isPublished?: boolean | null;
  createdAt?: Date | string;
  updatedAt?: Date | string | null;
}

interface PostFormDialogProps {
  mode: "create" | "edit";
  post?: PostItemData;
  trigger?: React.ReactNode;
}

export default function PostFormDialog({
  mode,
  post,
  trigger,
}: PostFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [sort] = useQueryState("sort");
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? "",
      content: post?.content ?? "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const { data, error } = await api.posts.post(values);
      if (error) {
        throw new Error(
          typeof error.value === "object" && error.value && "message" in error.value
            ? String(error.value.message)
            : "Failed to create post",
        );
      }
      return data;
    },
    onMutate: () => {
      const toastLoading = toast.loading("Creating post...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Post created successfully");

      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });

      form.reset();
      setOpen(false);
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to create post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormData & { id: string }) => {
      const { id, ...body } = values;
      const { data, error } = await api.posts({ id }).put(body);
      if (error) {
        throw new Error(
          typeof error.value === "object" && error.value && "message" in error.value
            ? String(error.value.message)
            : "Failed to update post",
        );
      }
      return data;
    },
    onMutate: () => {
      const toastLoading = toast.loading("Updating post...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Post updated successfully");

      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
      form.reset();
      setOpen(false);
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to update post");
    },
  });

  async function onSubmit(values: FormData) {
    mode === "create"
      ? await createMutation.mutateAsync(values)
      : await updateMutation.mutateAsync({ ...values, id: post?.id! });
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
      <DialogContent className="rounded-lg sm:max-w-[725px] dark:border-stone-800/90 dark:bg-stone-900">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      editable={true}
                      className="min-h-[300px] sm:max-w-[725px]"
                      immediatelyRender={false}
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
