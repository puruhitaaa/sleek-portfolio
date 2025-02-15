// @ts-nocheck
// this file is not checked because for some reason the role field from user session is not recognized as a known type

import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/client"
import { toast } from "sonner"
import CommentFormDialog from "./CommentFormDialog"
import type { InferOutput } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

type CommentItemProps = InferOutput["comments"]["list"]["items"][number]

export function CommentItem({
  id,
  content,
  createdAt,
  user,
}: CommentItemProps) {
  const queryClient = useQueryClient()
  const { data: authData } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await client.comments.delete.$post({ id })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Deleting comment...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Comment deleted successfully")

      queryClient.invalidateQueries({
        queryKey: ["comments"],
      })
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to delete comment")
    },
  })

  const isOwner = authData?.session?.userId === user?.id
  const isAdmin = authData?.user?.role === "admin"
  const canModify = isOwner || isAdmin

  return (
    <Card className='bg-stone-900/80 border-stone-800/90 rounded-lg'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3 mb-2'>
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={24}
              height={24}
              className='rounded-full object-cover w-8 h-8'
            />
          ) : (
            <div className='w-8 h-8 rounded-full bg-stone-800' />
          )}
          <div className='flex justify-between items-center w-full'>
            <span className='text-sm font-medium dark:text-foreground text-zinc-100'>
              {user?.name}
            </span>

            <div className='flex items-center gap-2'>
              <time className='text-sm dark:text-zinc-500 text-zinc-400'>
                {format(createdAt, "MMM d, yyyy")}
              </time>
              {canModify ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreHorizontal className='h-4 w-4 dark:text-foreground text-zinc-100' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-40 bg-stone-900 border-stone-800'>
                    <div className='flex flex-col space-y-3'>
                      {isOwner && (
                        <CommentFormDialog
                          mode='edit'
                          comment={{ id, content }}
                          trigger={
                            <Button className='w-full grid grid-cols-3 text-zinc-400 hover:text-zinc-100 bg-yellow-700 hover:bg-yellow-500 text-foreground'>
                              <Pencil className='h-4 w-4 dark:text-foreground text-zinc-100' />
                              <span className='col-span-2 dark:text-foreground text-zinc-100'>
                                Update
                              </span>
                            </Button>
                          }
                        />
                      )}
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
        </div>
        <p className='dark:text-zinc-400 text-zinc-300 break-words whitespace-pre-wrap max-h-32 overflow-y-auto'>
          {content}
        </p>
      </CardContent>
    </Card>
  )
}
