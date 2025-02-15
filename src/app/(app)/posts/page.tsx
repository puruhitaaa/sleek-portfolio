import { siteConfig } from "@/site"
import PostList from "./_components/PostList"
import { Metadata } from "next"
import PostHeader from "./_components/PostHeader"
import { Suspense } from "react"
import { LoadSkeleton } from "./_components/LoadSkeleton"
export const metadata: Metadata = {
  title: `Posts - ${siteConfig.name} Personal Site`,
  description: `${siteConfig.name}'s personal posts.`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function PostsPage() {
  return (
    <div className='space-y-6'>
      <h1 className='text-xl font-medium dark:text-zinc-100 text-zinc-900'>
        Posts ~
      </h1>
      <Suspense fallback={<LoadSkeleton />}>
        <PostHeader />
        <PostList />
      </Suspense>
    </div>
  )
}
