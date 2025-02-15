import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useState } from "react"
import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const formSchema = z.object({
  content: z.string().min(1, "Content is required"),
})

type FormData = z.infer<typeof formSchema>

interface CommentFormDialogProps {
  mode?: "create" | "edit"
  comment?: {
    id: number
    content: string
  }
  trigger?: React.ReactNode
}

export default function CommentFormDialog({
  mode = "create",
  comment,
  trigger,
}: CommentFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: comment?.content ?? "",
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await client.comments.create.$post({
        content: values.content,
      })
      return res.json()
    },
    onMutate: () => {
      const loadingToast = toast.loading("Checking for profanity...")

      return { loadingToast }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success("Comment added successfully")
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      })
      form.reset()
      setOpen(false)
    },
    onError: (error, _, context) => {
      toast.dismiss(context?.loadingToast)
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!comment) throw new Error("No comment provided for update")
      const res = await client.comments.update.$post({
        id: comment.id,
        content: values.content,
      })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Updating comment...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Comment updated successfully")
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      })
      form.reset()
      setOpen(false)
    },
    onError: (error, _, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error(error.message)
    },
  })

  const mutation = mode === "create" ? createMutation : updateMutation

  async function onSubmit(values: FormData) {
    mutation.mutate(values)
  }

  const defaultTrigger = (
    <Button
      className='dark:text-zinc-100 text-zinc-900 hover:text-zinc-100 dark:hover:text-zinc-900'
      size='icon'
      variant='outline'
    >
      <Plus />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px] dark:bg-stone-900 dark:border-stone-800/90 rounded-lg'>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Comment" : "Edit Comment"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Write your comment...'
                      className='min-h-32 max-h-72'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full text-zinc-100 dark:text-foreground'
            >
              {mode === "create" ? "Add Comment" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
