import { format } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn, type InferOutput } from "@/lib/utils"
import Image from "next/image"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { client } from "@/lib/client"
import { toast } from "sonner"
import ProjectFormDialog from "./ProjectFormDialog"
import { authClient } from "@/lib/auth-client"

type ProjectItemProps = InferOutput["projects"]["list"]["items"][number]

export function ProjectItem(project: ProjectItemProps) {
  const {
    name,
    description,
    image,
    websiteLink,
    githubLink,
    youtubeLink,
    createdAt,
  } = project
  const queryClient = useQueryClient()
  const [sort] = useQueryState("sort")

  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await client.projects.delete.$post({
        id: project.id,
        imageUrl: project.image,
      })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Deleting project...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Project deleted successfully")

      queryClient.invalidateQueries({
        queryKey: ["projects", sort],
      })
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to delete project")
    },
  })

  return (
    <Card className='bg-stone-900/80 border-stone-800/90 group rounded-lg'>
      <CardHeader className='space-y-2'>
        <div className='flex justify-between items-center'>
          <h3 className='font-medium dark:text-foreground text-zinc-100'>
            {name}
          </h3>
          <div
            className={cn({
              "flex items-center gap-3": authData?.session,
            })}
          >
            <time className='text-sm dark:text-zinc-500 text-zinc-400'>
              {format(createdAt, "MMM d, yyyy")}
            </time>
            {authData?.session ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreHorizontal className='h-4 w-4 dark:text-foreground text-zinc-100' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-40 bg-stone-900 border-stone-800'>
                  <div className='flex flex-col space-y-3'>
                    <ProjectFormDialog
                      mode='edit'
                      project={project}
                      trigger={
                        <Button className='w-full grid grid-cols-3 text-zinc-400 hover:text-zinc-100 bg-yellow-700 hover:bg-yellow-500 text-foreground'>
                          <Pencil className='h-4 w-4 dark:text-foreground text-zinc-100' />
                          <span className='col-span-2 dark:text-foreground text-zinc-100'>
                            Update
                          </span>
                        </Button>
                      }
                    />
                    <Button
                      variant='ghost'
                      className='w-full grid grid-cols-3 text-zinc-400 hover:text-zinc-100 bg-red-700 hover:bg-red-500 text-foreground'
                      onClick={() => deleteMutation.mutate()}
                    >
                      <Trash className='h-4 w-4 dark:text-foreground text-zinc-100' />
                      <span className='col-span-2 dark:text-foreground text-zinc-100'>
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
      <CardContent className='space-y-4'>
        <Image
          src={image}
          alt={name}
          width={800}
          height={400}
          className='rounded-lg w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 max-h-[20rem]'
        />
        <p className='dark:text-zinc-400 text-zinc-300 truncate'>
          {description}
        </p>
        <div className='flex gap-4'>
          {websiteLink ? (
            <a
              href={websiteLink}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-zinc-400 dark:text-zinc-600'
            >
              Website
            </a>
          ) : null}
          {githubLink ? (
            <a
              href={githubLink}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-zinc-400 dark:text-zinc-600'
            >
              GitHub
            </a>
          ) : null}
          {youtubeLink ? (
            <a
              href={youtubeLink}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-zinc-400 dark:text-zinc-600'
            >
              YouTube
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
