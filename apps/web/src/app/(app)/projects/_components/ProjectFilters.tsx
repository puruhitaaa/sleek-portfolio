"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQueryState } from "nuqs"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
]

export default function ProjectFilters() {
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "newest",
  })

  return (
    <div className='flex gap-4'>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Sort by' />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
