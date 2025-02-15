import { format } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn, type InferOutput } from "@/lib/utils"
import LogFormDialog from "./LogFormDialog"
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
import { authClient } from "@/lib/auth-client"

type LogItemProps = {
  log: InferOutput["logs"]["list"]["items"][number]
}

export function LogItem({ log }: LogItemProps) {
  const { title, content, createdAt } = log
  const queryClient = useQueryClient()
  const [category] = useQueryState("category")
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
      const res = await client.logs.delete.$post({ id: log.id })
      return res.json()
    },
    onMutate: () => {
      const toastLoading = toast.loading("Deleting log...")
      return { toastLoading }
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.success("Log deleted successfully")

      queryClient.invalidateQueries({
        queryKey: ["logs", category, sort],
      })
    },
    onError: (_, __, context) => {
      toast.dismiss(context?.toastLoading)
      toast.error("Failed to delete log")
    },
  })

  const handleDelete = async () => {
    await deleteMutation.mutateAsync()
  }

  return (
    <Card className='bg-stone-900/80 border-stone-800/90 rounded-lg'>
      <CardHeader className='space-y-2'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
          <span className='text-sm text-zinc-400 dark:text-zinc-600'>
            {log.category}
          </span>
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
                    <LogFormDialog
                      mode='edit'
                      log={log}
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
                      onClick={handleDelete}
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
        <h3 className='font-medium dark:text-foreground text-zinc-100'>
          {title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className='dark:text-zinc-400 text-zinc-300'>{content}</p>
      </CardContent>
    </Card>
  )
}
