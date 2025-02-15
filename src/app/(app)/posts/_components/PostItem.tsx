import { format } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { InferOutput } from "@/lib/utils"
import { toast } from "sonner"
import { client } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { MoreHorizontal } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import PostFormDialog from "./PostFormDialog"
import { Pencil, Trash } from "lucide-react"
import { useQueryState } from "nuqs"
import { authClient } from "@/lib/auth-client"

type PostItemProps = InferOutput["posts"]["list"]["items"][number]

export function PostItem(post: PostItemProps) {
  const { id, title, createdAt } = post
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
      const res = await client.posts.delete.$post({ id })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Deleting post...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Post deleted successfully")

      queryClient.invalidateQueries({
        queryKey: ["posts", sort],
      })
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to delete post")
    },
  })

  return (
    <Card className='bg-stone-900/80 border-stone-800/90 group transition-colors rounded-lg'>
      <CardHeader className='space-y-2'>
        <div className='flex justify-between items-center'>
          <h3 className='font-medium dark:text-foreground text-zinc-100'>
            {title}
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
                    <PostFormDialog
                      mode='edit'
                      post={post}
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
      <CardContent>
        <Button asChild variant='outline'>
          <Link
            className='dark:text-zinc-400 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-stone-900/80 border-input'
            href={`/posts/${id}`}
          >
            View Post
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
