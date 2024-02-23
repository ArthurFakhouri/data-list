import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, FileDown, Filter, Loader2, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react"
import { Header } from "./components/header"
import { Tabs } from "./components/tabs"
import { Button } from "./components/ui/button"
import { Control, Input } from "./components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Pagination } from "./components/pagination"
import { useSearchParams } from "react-router-dom"
import { MouseEvent, useEffect, useMemo, useState } from "react"
import * as Dialog from '@radix-ui/react-dialog'
import * as PopOver from '@radix-ui/react-popover'
import * as Alert from '@radix-ui/react-alert-dialog'
import { CreateTagForm } from "./components/create-tag-form"
import { Checkbox } from "./components/ui/checkbox"
import colors from 'tailwindcss/colors'
import { toast } from "sonner"
import { CSVLink } from 'react-csv'
import { FileCsv, FilePdf } from '@phosphor-icons/react'
import { capitalize } from "./utils/capitalize"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { TagPDF } from "./components/pdf/tags"

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
  const queryClient = useQueryClient()

  const { mutateAsync: deleteTagAsync, isPending } = useMutation({
    mutationFn: async ({ id }: CheckedTag) => {
      // delay 2s
      await new Promise(resolve => setTimeout(resolve, 2000))

      await fetch(`http://localhost:3333/tags/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags'],
      })
      toast.success('Tag removida com sucesso!')
      setOpenPopOver("")
      setOpenAlert([])
      setCheckedTagList([])
    }
  })

  useEffect(() => {
    const onclick = () => {
      if (openPopOver !== "") {
        setOpenPopOver("")
      }
    }

    document.addEventListener('click', onclick)

    return () => document.removeEventListener('click', onclick)
  })

  const [searchParams, setSearchParams] = useSearchParams()

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1
  const urlFilter = searchParams.get('filter') ?? ""

  const [filter, setFilter] = useState(urlFilter)
  const [openPopOver, setOpenPopOver] = useState("")
  const [openAlert, setOpenAlert] = useState<string[]>([])

  const [checkedTagList, setCheckedTagList] = useState<Tag[]>([])

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ['get-tags', urlFilter, page],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`)
      const data = await response.json()

      return data
    },
    placeholderData: keepPreviousData,
  })

  const { header, data } = useMemo(() => {
    if (checkedTagList.length !== 0) {
      const header = Object.keys(checkedTagList[0]).map(key => {
        return {
          label: capitalize(key),
          key,
        }
      })

      const data = checkedTagList

      return { header, data }
    }

    return { header: [], data: [] }
  }, [checkedTagList, tagsResponse])

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

  function handleCheckedTag(tag: Tag) {
    if (checkedTagList.some(checkedTag => checkedTag.id === tag.id)) {
      const newCheckedTags = checkedTagList.filter(checkedTag => checkedTag.id !== tag.id)

      setCheckedTagList(newCheckedTags)
    } else {

      setCheckedTagList(checkedTagList => [...checkedTagList, tag])
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

        setCheckedTagList(checkedTagList => [...checkedTagList, ...newCheckedTagList])
      }
    }
  }

  function handleIsCheckedTag(tagId: string) {
    return checkedTagList.some(checkedTag => checkedTag.id === tagId)
  }

  async function deleteTag(event: MouseEvent<HTMLButtonElement>, ids: string[]) {
    event.stopPropagation()


    await Promise.all(ids.map(id => deleteTagAsync({ id })))
  }

  function handleExtendPopOver(event: MouseEvent<HTMLButtonElement>, tagId: string) {
    event.stopPropagation()

    if (openPopOver === "") {
      setOpenPopOver(tagId)
    } else {
      setOpenPopOver("")
    }
  }

  function handleExpandAlert(event: MouseEvent<HTMLButtonElement>, tagIds: string[]) {
    event.stopPropagation()

    setOpenAlert([...tagIds])
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
            <PopOver.Root>
              <PopOver.Trigger asChild>
                <Button disabled={checkedTagList.length === 0}>
                  <FileDown className="size-3" />
                  Export...
                </Button>
              </PopOver.Trigger>
              <PopOver.Content className="flex flex-col gap-1.5 w-min-[200px] w-[200px] rounded-xl p-4 border border-zinc-800 bg-black" sideOffset={5}>
                <CSVLink
                  headers={header}
                  data={data}
                  className="flex items-center gap-1.5 text-xs transition background hover:bg-zinc-700 px-5 py-2 rounded-md"
                  separator=";"
                  filename="TagList.csv"
                >
                  <FileCsv className="size-5" color={colors.green[500]} weight="fill" />
                  CSV File
                </CSVLink>
                <PDFDownloadLink
                  document={<TagPDF tags={data} />}
                  fileName="TagList.pdf"
                >
                  {({ blob, url, loading, error }) => (
                    <Button disabled={loading} className="w-full px-5 py-2 round-md bg-transparent border-0 transition background hover:bg-zinc-700">
                      <FilePdf className="size-5" color={colors.red[400]} weight="fill" />
                      PDF File
                    </Button>
                  )}
                </PDFDownloadLink>
                <PopOver.Arrow className="fill-zinc-800" />
              </PopOver.Content>
            </PopOver.Root>
            <Button onClick={(e) => handleExpandAlert(e, checkedTagList.map(checkedTag => checkedTag.id))} variant="delete" disabled={checkedTagList.length === 0}>
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
                    <Checkbox onChange={() => handleCheckedTag(tag)} checked={handleIsCheckedTag(tag.id)} />
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
                    <PopOver.Root open={openPopOver === tag.id}>
                      <PopOver.Trigger asChild>
                        <Button onClick={(e) => handleExtendPopOver(e, tag.id)} size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </PopOver.Trigger>
                      <PopOver.Portal>
                        <PopOver.Content className="flex flex-col gap-1.5 w-min-[200px] w-[200px] rounded-xl p-4 border border-zinc-800 bg-black" sideOffset={5}>
                          <Button type="button" onClick={(e) => handleExpandAlert(e, [tag.id])} variant="delete">
                            Delete tag
                          </Button>
                          <PopOver.Arrow className="fill-zinc-800" />
                        </PopOver.Content>
                      </PopOver.Portal>
                    </PopOver.Root>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Alert.Root open={openAlert.length !== 0}>
          <Alert.Trigger asChild>
          </Alert.Trigger>
          <Alert.Portal>
            <Alert.Overlay className="fixed inset-0 bg-black/70" />
            <Alert.Content className="fixed space-y-3 top-1/2 left-1/2  transform -translate-x-1/2 -translate-y-1/2 p-5 border border-zinc-800 bg-zinc-900 rounded-md">
              <Alert.Title className="flex flex-col justify-center items-center font-bold">
                <AlertTriangle className="size-10" color={colors.yellow[500]} />
                Delete Tag
              </Alert.Title>
              <Alert.Description className="text-zinc-400">
                Are you sure about delete {openAlert.length} tag(s)?
              </Alert.Description>
              <div className="w-full flex justify-between gap-1.5">
                <Alert.Cancel asChild>
                  <Button onClick={() => setOpenAlert([])} className="w-[120px] justify-center">
                    <X className="size-3" />
                    Cancel
                  </Button>
                </Alert.Cancel>
                <Alert.Action asChild>
                  <Button onClick={(e) => deleteTag(e, openAlert)} variant="primary" className="w-[120px] justify-center">
                    {isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                    Delete
                  </Button>
                </Alert.Action>
              </div>
            </Alert.Content>
          </Alert.Portal>
        </Alert.Root>

        {tagsResponse && <Pagination items={tagsResponse.items} pages={tagsResponse.pages} page={page} />}
      </main>
    </div>
  )
}