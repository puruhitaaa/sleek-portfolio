"use client"

import { Skeleton } from "@/components/ui/skeleton"

export const LoadSkeleton = () => {
  return Array.from({ length: 6 }).map((_, index) => (
    <Skeleton key={index} className='h-36' />
  ))
}
