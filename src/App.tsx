import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FileDown, Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import { Header } from "./components/header"
import { Tabs } from "./components/tabs"
import { Button } from "./components/ui/button"
import { Control, Input } from "./components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Pagination } from "./components/pagination"
import { useSearchParams } from "react-router-dom"
import { useState } from "react"
import * as Dialog from '@radix-ui/react-dialog'
import { CreateTagForm } from "./components/create-tag-form"
import { Checkbox } from "./components/ui/checkbox"

export interface TagResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export interface Tag {
  id: string
  title: string
  slug: string
  quantity: number
}

type CheckedTag = {
  id: string
}

export function App() {

  const [searchParams, setSearchParams] = useSearchParams()

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1
  const urlFilter = searchParams.get('filter') ?? ""

  const [filter, setFilter] = useState(urlFilter)

  const [checkedTagList, setCheckedTagList] = useState<CheckedTag[]>([])

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ['get-tags', urlFilter, page],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`)
      const data = await response.json()

      return data
    },
    placeholderData: keepPreviousData,
  })

  if (isLoading) {
    return null
  }

  function handleFilter() {
    setSearchParams(params => {
      params.set('page', '1')
      params.set('filter', filter)

      return params
    })
  }

  function handleCheckedTag(tagId: string) {
    if (checkedTagList.some(checkedTag => checkedTag.id === tagId)) {
      const newCheckedTags = checkedTagList.filter(checkedTag => checkedTag.id !== tagId)

      setCheckedTagList(newCheckedTags)
    } else {
      setCheckedTagList(checkedTagList => [...checkedTagList, { id: tagId }])
    }
  }

  function handleCheckEveryPageTags() {
    if (tagsResponse) {
      const tagListSize = tagsResponse.data.length

      let isEveryTagListChecked = true

      for (let i = 0; i < tagListSize; i++) {
        if (!checkedTagList.some(checkedTag => checkedTag.id === tagsResponse.data[i].id)) {
          isEveryTagListChecked = false
          i = tagListSize
        }
      }

      return isEveryTagListChecked
    }

    return false
  }

  function handleToggleCheckEveryone() {
    if (tagsResponse) {
      if (handleCheckEveryPageTags()) {
        const newCheckedTagList = checkedTagList.filter(checkedTag =>
          !tagsResponse.data.some(tag => tag.id === checkedTag.id)
        )

        setCheckedTagList(newCheckedTagList)
      } else {
        const newCheckedTagList = tagsResponse.data
          .filter(tag => !checkedTagList.some(checkedTag => checkedTag.id === tag.id))
          .map(tag => ({ id: tag.id }))

        setCheckedTagList(checkedTagList => [...checkedTagList, ...newCheckedTagList])
      }
    }
  }

  function handleIsCheckedTag(tagId: string) {
    return checkedTagList.some(checkedTag => checkedTag.id === tagId)
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>
      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="primary" >
                <Plus className="size-3" />
                Create new
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed space-y-10 right-0 top-0 bottom-0 h-screen min-w-[320px] bg-zinc-950 border-l border-zinc-900 p-10">
                <div className="space-y-3">
                  <Dialog.Title className="text-xl font-bold">
                    Create  tag
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-zinc-500">
                    Tags can be used to group videos about similar concepts.
                  </Dialog.Description>
                </div>
                <CreateTagForm />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Input variant="filter">
              <Search className="size-3" />
              <Control
                placeholder="Search tags..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Input>
            <Button onClick={handleFilter}>
              <Filter className="size-3" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button disabled={checkedTagList.length === 0}>
              <FileDown className="size-3" />
              Export
            </Button>
            <Button variant="delete" disabled={checkedTagList.length === 0}>
              Delete tag(s)
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Checkbox onChange={handleToggleCheckEveryone} checked={handleCheckEveryPageTags()} /></TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Quantity of videos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagsResponse?.data.map(tag => {
              return (
                <TableRow key={tag.id}>
                  <TableCell className="w-1">
                    <Checkbox onChange={() => handleCheckedTag(tag.id)} checked={handleIsCheckedTag(tag.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{tag.title}</span>
                      <span className="text-xs text-zinc-500">{tag.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {tag.quantity} video(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {tagsResponse && <Pagination items={tagsResponse.items} pages={tagsResponse.pages} page={page} />}
      </main>
    </div>
  )
}