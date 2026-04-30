import { type Metadata } from "next"
import ProjectList from "./_components/ProjectList"
import { siteConfig } from "@/site"
import ProjectHeader from "./_components/ProjectHeader"
import { Suspense } from "react"
import { LoadSkeleton } from "./_components/LoadSkeleton"

export const metadata: Metadata = {
  title: `Projects - ${siteConfig.name} Personal Site`,
  description: `${siteConfig.name}'s personal projects.`,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function ProjectsPage() {
  return (
    <div className='space-y-6'>
      <h1 className='text-xl font-medium dark:text-zinc-100 text-zinc-900'>
        Projects ~
      </h1>
      <Suspense fallback={<LoadSkeleton />}>
        <ProjectHeader />
        <ProjectList />
      </Suspense>
    </div>
  )
}
