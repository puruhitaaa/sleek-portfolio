import { type Metadata } from "next"
import CommentList from "./_components/CommentList"
import { siteConfig } from "@/site"
import CommentHeader from "./_components/CommentHeader"
import { Suspense } from "react"
import { LoadSkeleton } from "./_components/LoadSkeleton"

export const metadata: Metadata = {
  title: `Guestbook - ${siteConfig.name} Personal Site`,
  description: `${siteConfig.name}'s personal guestbook.`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function GuestbookPage() {
  return (
    <div className='space-y-6'>
      <Suspense fallback={<LoadSkeleton />}>
        <CommentHeader />
        <CommentList />
      </Suspense>
    </div>
  )
}
