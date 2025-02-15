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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { type InferOutput } from "@/lib/utils"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
})

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
] as const

type FormData = z.infer<typeof formSchema>

interface LogFormDialogProps {
  mode: "create" | "edit"
  log?: InferOutput["logs"]["list"]["items"][number]
  trigger?: React.ReactNode
}

export default function LogFormDialog({
  mode,
  log,
  trigger,
}: LogFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [category] = useQueryState("category")
  const [sort] = useQueryState("sort")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: log?.title ?? "",
      content: log?.content ?? "",
      category: log?.category ?? "",
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await client.logs.create.$post({
        ...values,
      })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Creating log...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading)
      toast.success("Log created successfully")

      queryClient.invalidateQueries({
        queryKey: ["logs", category, sort],
      })

      form.reset()
      setOpen(false)
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to create log")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!log) throw new Error("No log provided for update")
      const res = await client.logs.update.$post({
        id: log.id,
        ...values,
      })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Updating log...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading)
      toast.success("Log updated successfully")

      queryClient.invalidateQueries({
        queryKey: ["logs", category, sort],
      })
      form.reset()
      setOpen(false)
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to update log")
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
      <DialogContent className='sm:max-w-[425px] dark:bg-stone-900 dark:border-stone-800/90 rounded-lg'>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Log" : "Edit Log"}
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
                    <Input placeholder='Enter log title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
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
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Write your log content...'
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
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
