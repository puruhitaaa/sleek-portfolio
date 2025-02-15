"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQueryState } from "nuqs"

const categories = [
  "all",
  "development",
  "database",
  "security",
  "frontend",
  "backend",
  "optimization",
  "testing",
  "devops",
  "documentation",
  "analytics",
  "other",
] as const

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
]

export default function LogFilters() {
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "all",
  })
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "newest",
  })

  return (
    <div className='flex gap-4'>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Select category' />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
