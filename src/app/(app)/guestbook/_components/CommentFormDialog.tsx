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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const formSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CommentFormDialogProps {
  mode?: "create" | "edit";
  comment?: {
    id: string;
    content: string;
  };
  trigger?: React.ReactNode;
}

export default function CommentFormDialog({
  mode = "create",
  comment,
  trigger,
}: CommentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: comment?.content ?? "",
    },
  });
  const createMutation = api.guestbook.create.useMutation({
    onMutate: () => {
      const loadingToast = toast.loading("Checking for profanity...");

      return { loadingToast };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.loadingToast);
      toast.success("Comment added successfully");
      utils.guestbook.list.invalidate({ limit: 10 });
      form.reset();
      setOpen(false);
    },
    onError: (error, _, context) => {
      toast.dismiss(context?.loadingToast);
      toast.error(error.message);
    },
  });

  const updateMutation = api.guestbook.update.useMutation({
    onMutate: () => {
      const toastLoading = toast.loading("Updating comment...");
      return { toastLoading };
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Comment updated successfully");
      utils.guestbook.list.invalidate({ limit: 10 });
      form.reset();
      setOpen(false);
    },
    onError: (error, _, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error(error.message);
    },
  });

  async function onSubmit(values: FormData) {
    if (mode === "create") {
      await createMutation.mutateAsync({ content: values.content });
    } else {
      await updateMutation.mutateAsync({
        id: comment?.id ?? "",
        content: values.content,
      });
    }
  }

  const defaultTrigger = (
    <Button
      className="text-zinc-900 hover:text-zinc-100 dark:text-zinc-100 dark:hover:text-zinc-900"
      size="icon"
      variant="outline"
    >
      <Plus />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="rounded-lg sm:max-w-[425px] dark:border-stone-800/90 dark:bg-stone-900">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Comment" : "Edit Comment"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your comment..."
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
              {mode === "create" ? "Add Comment" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
