"use client"

import { Skeleton } from "@/components/ui/skeleton"

export const LoadSkeleton = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <Skeleton key={index} className='h-32' />
  ))
}
