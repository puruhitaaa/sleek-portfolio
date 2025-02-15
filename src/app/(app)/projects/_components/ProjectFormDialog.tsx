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
import { Plus, Pencil, ImageIcon } from "lucide-react"
import { useState } from "react"
import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { type InferOutput } from "@/lib/utils"
import { toast } from "sonner"
import CustomImageUpload from "./CustomImageUploader"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL"),
  websiteLink: z.string().url("Must be a valid URL").nullish(),
  githubLink: z.string().url("Must be a valid URL").nullish(),
  youtubeLink: z.string().url("Must be a valid URL").nullish(),
})

type FormData = z.infer<typeof formSchema>

interface ProjectFormDialogProps {
  mode: "create" | "edit"
  project?: InferOutput["projects"]["list"]["items"][number]
  trigger?: React.ReactNode
}

export default function ProjectFormDialog({
  mode,
  project,
  trigger,
}: ProjectFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [sort] = useQueryState("sort")

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
  })

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await client.projects.create.$post(values)
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Creating project...", {
        duration: 1500,
      })
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading)
      toast.success("Project created successfully", {
        duration: 1500,
      })
      queryClient.invalidateQueries({
        queryKey: ["projects", sort],
      })
      form.reset()
      setOpen(false)
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to create project", {
        duration: 1500,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!project) throw new Error("No project provided for update")
      const res = await client.projects.update.$post({
        id: project.id,
        ...values,
        imageUrl: values.image,
      })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Updating project...", {
        duration: 1500,
      })
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context.toastLoading)
      toast.success("Project updated successfully", {
        duration: 1500,
      })
      queryClient.invalidateQueries({
        queryKey: ["projects", sort],
      })
      form.reset()
      setOpen(false)
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to update project", {
        duration: 1500,
      })
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
      <DialogContent className='sm:max-w-[425px] dark:bg-stone-900 dark:border-stone-800/90 rounded-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter project name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Write project description...'
                      className='min-h-32 max-h-72'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='image'
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
              name='websiteLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter website URL'
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
              name='githubLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter GitHub URL'
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
              name='youtubeLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter YouTube URL'
                      {...field}
                      value={field.value!}
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
