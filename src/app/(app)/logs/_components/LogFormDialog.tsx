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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
});

const categories = [
  "development",
  "database",
  "security",
  "frontend",
  "backend",
  "optimization",
  "testing",
  "devops",
  "documentation",
  "analytics",
  "other",
] as const;

type FormData = z.infer<typeof formSchema>;

interface LogItemData {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublished?: boolean | null;
  createdAt?: Date | string;
  updatedAt?: Date | string | null;
}

interface LogFormDialogProps {
  mode: "create" | "edit";
  log?: LogItemData;
  trigger?: React.ReactNode;
}

export default function LogFormDialog({
  mode,
  log,
  trigger,
}: LogFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [category] = useQueryState("category");
  const [sort] = useQueryState("sort");
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: log?.title ?? "",
      content: log?.content ?? "",
      category: log?.category ?? "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const { data, error } = await api.logs.post(values);
      if (error) {
        throw new Error(
          typeof error.value === "object" && error.value && "message" in error.value
            ? String(error.value.message)
            : "Failed to create log",
        );
      }
      return data;
    },
    onMutate: () => {
      const toastLoading = toast.loading("Creating log...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading);
      toast.success("Log created successfully");

      queryClient.invalidateQueries({ queryKey: ["logs", "list"] });
      form.reset();
      setOpen(false);
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to create log");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormData & { id: string }) => {
      const { id, ...body } = values;
      const { data, error } = await api.logs({ id }).put(body);
      if (error) {
        throw new Error(
          typeof error.value === "object" && error.value && "message" in error.value
            ? String(error.value.message)
            : "Failed to update log",
        );
      }
      return data;
    },
    onMutate: () => {
      const toastLoading = toast.loading("Updating log...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading);
      toast.success("Log updated successfully");

      queryClient.invalidateQueries({ queryKey: ["logs", "list"] });
      form.reset();
      setOpen(false);
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error("Failed to update log");
    },
  });

  async function onSubmit(values: FormData) {
    mode === "create"
      ? await createMutation.mutateAsync(values)
      : await updateMutation.mutateAsync({ ...values, id: log?.id! });
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
      <DialogContent className="rounded-lg sm:max-w-[425px] dark:border-stone-800/90 dark:bg-stone-900">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Log" : "Edit Log"}
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
                    <Input placeholder="Enter log title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea
                      placeholder="Write your log content..."
                      className="max-h-72 min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
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
