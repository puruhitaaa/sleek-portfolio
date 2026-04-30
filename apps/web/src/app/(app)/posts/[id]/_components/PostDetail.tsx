"use client"

import { format } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MinimalTiptapEditor } from "@/components/minimal-tiptap"

type PostDetailProps = {
  title: string
  content: string
  createdAt: Date
}

export function PostDetail({ title, content, createdAt }: PostDetailProps) {
  return (
    <Card className='bg-stone-900/80 border-stone-800/90 dark:text-foreground text-zinc-100'>
      <CardHeader className='space-y-2'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-medium'>{title}</h1>
          <time className='text-sm dark:text-zinc-500 text-zinc-400'>
            {format(createdAt, "MMM d, yyyy")}
          </time>
        </div>
      </CardHeader>
      <CardContent className='prose prose-invert max-w-none'>
        <MinimalTiptapEditor
          immediatelyRender={false}
          value={content}
          onChange={() => {}}
          className='w-full'
          editorContentClassName='p-3'
          output='text'
          editable={false}
          editorClassName='focus:outline-none'
        />
      </CardContent>
    </Card>
  )
}
