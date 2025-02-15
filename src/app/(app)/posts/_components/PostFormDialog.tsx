"use client"

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
import { Input } from "@/components/ui/input"
import { Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { type InferOutput } from "@/lib/utils"
import { toast } from "sonner"
import { MinimalTiptapEditor } from "@/components/minimal-tiptap"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
})

type FormData = z.infer<typeof formSchema>

interface PostFormDialogProps {
  mode: "create" | "edit"
  post?: InferOutput["posts"]["list"]["items"][number]
  trigger?: React.ReactNode
}

export default function PostFormDialog({
  mode,
  post,
  trigger,
}: PostFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [sort] = useQueryState("sort")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? "",
      content: post?.content ?? "",
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await client.posts.create.$post(values)
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Creating post...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Post created successfully")

      queryClient.invalidateQueries({
        queryKey: ["posts", sort],
      })
      form.reset()
      setOpen(false)
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to create post")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!post) throw new Error("No post provided for update")
      const res = await client.posts.update.$post({
        id: post.id,
        ...values,
      })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Updating post...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Post updated successfully")

      queryClient.invalidateQueries({
        queryKey: ["posts", sort],
      })
      form.reset()
      setOpen(false)
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to update post")
    },
  })

  const mutation = mode === "create" ? createMutation : updateMutation

  async function onSubmit(values: FormData) {
    mutation.mutate(values)
  }

  const defaultTrigger =
    mode === "create" ? (
      <Button
        className='dark:text-zinc-100 text-zinc-900 hover:text-zinc-100 dark:hover:text-zinc-900'
        size='icon'
        variant='outline'
      >
        <Plus />
      </Button>
    ) : (
      <Button
        className='dark:text-zinc-100 text-zinc-900 hover:text-zinc-100 dark:hover:text-zinc-900'
        variant='ghost'
        size='icon'
      >
        <Pencil className='h-4 w-4' />
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className='sm:max-w-[725px] dark:bg-stone-900 dark:border-stone-800/90 rounded-lg'>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter post title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      editable={true}
                      className='min-h-[300px] sm:max-w-[725px]'
                      immediatelyRender={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={mutation.isPending || !form.formState.isValid}
              type='submit'
              className='w-full text-zinc-100 dark:text-foreground'
            >
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
