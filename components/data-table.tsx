"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import type { ResumoTransacao } from "@/types"
import transacaoService from "@/services/transacao-service"
import { cn, formatarData, formatarMoeda, tratarErro } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

type TransactionStatus = "Confirmada" | "Agendada"

type TransactionTableRow = {
  id: number
  descricao: string
  categoria: string
  tipo: "RECEITA" | "DESPESA"
  valor: number
  data: string
  conta: string
  status: TransactionStatus
  transacao: ResumoTransacao
}

const statusVariant: Record<TransactionStatus, "outline" | "secondary"> = {
  Confirmada: "secondary",
  Agendada: "outline",
}

interface DataTableProps {
  data: ResumoTransacao[]
  onDataChanged?: () => Promise<void> | void
}

export function DataTable({ data, onDataChanged }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "data", desc: true }])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "RECEITA" | "DESPESA">("all")
  const [selectedTransaction, setSelectedTransaction] = React.useState<ResumoTransacao | null>(null)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [processingDuplicateId, setProcessingDuplicateId] = React.useState<number | null>(null)
  const [editDescricao, setEditDescricao] = React.useState("")
  const [editValor, setEditValor] = React.useState("")
  const [editData, setEditData] = React.useState("")
  const [editObservacoes, setEditObservacoes] = React.useState("")
  const { toast } = useToast()
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 8,
  })

  const tableData = React.useMemo<TransactionTableRow[]>(() => {
    const today = new Date().toISOString().slice(0, 10)
    return data.map((item) => ({
      id: item.id,
      descricao: item.descricao,
      categoria: item.categoriaNome,
      tipo: item.tipo,
      valor: item.valor,
      data: item.data,
      conta: item.contaNome,
      status: item.data > today ? "Agendada" : "Confirmada",
      transacao: item,
    }))
  }, [data])

  const filteredData = React.useMemo(() => {
    return tableData.filter((item) => {
      const matchesType = typeFilter === "all" || item.tipo === typeFilter
      const term = search.trim().toLowerCase()
      const matchesSearch =
        term.length === 0 ||
        item.descricao.toLowerCase().includes(term) ||
        item.categoria.toLowerCase().includes(term) ||
        item.conta.toLowerCase().includes(term)

      return matchesType && matchesSearch
    })
  }, [search, tableData, typeFilter])

  const refreshData = React.useCallback(async () => {
    if (onDataChanged) {
      await onDataChanged()
    }
  }, [onDataChanged])

  const openDetails = React.useCallback((tx: ResumoTransacao) => {
    setSelectedTransaction(tx)
    setDetailsOpen(true)
  }, [])

  const openEdit = React.useCallback((tx: ResumoTransacao) => {
    setSelectedTransaction(tx)
    setEditDescricao(tx.descricao)
    setEditValor(String(tx.valor))
    setEditData(tx.data)
    setEditObservacoes(tx.observacoes ?? "")
    setEditOpen(true)
  }, [])

  const openDelete = React.useCallback((tx: ResumoTransacao) => {
    setSelectedTransaction(tx)
    setDeleteOpen(true)
  }, [])

  const handleDuplicate = React.useCallback(
    async (tx: ResumoTransacao) => {
      try {
        setProcessingDuplicateId(tx.id)
        await transacaoService.criar({
          descricao: tx.descricao,
          valor: tx.valor,
          tipo: tx.tipo,
          data: tx.data,
          contaId: tx.contaId,
          categoriaId: tx.categoriaId,
          cardId: tx.cardId,
          observacoes: tx.observacoes,
        })
        await refreshData()
        toast({
          title: "Transacao duplicada",
          description: "A nova transacao foi criada com sucesso.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao duplicar",
          description: tratarErro(error),
        })
      } finally {
        setProcessingDuplicateId(null)
      }
    },
    [refreshData, toast]
  )

  const handleSaveEdit = React.useCallback(async () => {
    if (!selectedTransaction) return

    const parsedValor = Number(editValor)
    if (!editDescricao.trim() || !editData || Number.isNaN(parsedValor) || parsedValor <= 0) {
      toast({
        variant: "destructive",
        title: "Dados invalidos",
        description: "Preencha descricao, valor e data corretamente.",
      })
      return
    }

    try {
      setIsSavingEdit(true)
      await transacaoService.atualizar(selectedTransaction.id, {
        descricao: editDescricao.trim(),
        valor: parsedValor,
        tipo: selectedTransaction.tipo,
        data: editData,
        contaId: selectedTransaction.contaId,
        categoriaId: selectedTransaction.categoriaId,
        cardId: selectedTransaction.cardId,
        observacoes: editObservacoes.trim() || undefined,
      })
      setEditOpen(false)
      await refreshData()
      toast({
        title: "Transacao atualizada",
        description: "As alteracoes foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao editar",
        description: tratarErro(error),
      })
    } finally {
      setIsSavingEdit(false)
    }
  }, [editData, editDescricao, editObservacoes, editValor, refreshData, selectedTransaction, toast])

  const handleDelete = React.useCallback(async () => {
    if (!selectedTransaction) return
    try {
      setIsDeleting(true)
      await transacaoService.excluir(selectedTransaction.id)
      setDeleteOpen(false)
      await refreshData()
      toast({
        title: "Transacao excluida",
        description: "A transacao foi removida com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: tratarErro(error),
      })
    } finally {
      setIsDeleting(false)
    }
  }, [refreshData, selectedTransaction, toast])

  const columns = React.useMemo<ColumnDef<TransactionTableRow>[]>(
    () => [
      {
        accessorKey: "descricao",
        header: "Descricao",
        cell: ({ row }) => (
          <div className="grid gap-0.5">
            <span className="font-medium">{row.original.descricao}</span>
            <span className="text-xs text-muted-foreground">{row.original.categoria}</span>
          </div>
        ),
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => (
          <Badge variant="outline" className="w-fit">
            {row.original.tipo === "RECEITA" ? "Receita" : "Despesa"}
          </Badge>
        ),
      },
      {
        accessorKey: "valor",
        header: () => <div className="text-right">Valor</div>,
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right font-medium",
              row.original.tipo === "RECEITA" ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {row.original.tipo === "RECEITA" ? "+" : "-"} {formatarMoeda(row.original.valor)}
          </div>
        ),
      },
      {
        accessorKey: "data",
        header: "Data",
        cell: ({ row }) => <span className="text-muted-foreground">{formatarData(row.original.data)}</span>,
      },
      {
        accessorKey: "conta",
        header: "Conta",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const tx = row.original.transacao
          const isDuplicating = processingDuplicateId === tx.id
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                >
                  <IconDotsVertical />
                  <span className="sr-only">Abrir acoes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => openDetails(tx)}>Ver detalhes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEdit(tx)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleDuplicate(tx)} disabled={isDuplicating}>
                  {isDuplicating ? "Duplicando..." : "Duplicar transacao"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => openDelete(tx)}>
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleDuplicate, openDelete, openDetails, openEdit, processingDuplicateId]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <div className="w-full flex-col justify-start gap-6 px-4 lg:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Tabs
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as "all" | "RECEITA" | "DESPESA")}
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="RECEITA">Receitas</TabsTrigger>
                <TabsTrigger value="DESPESA">Despesas</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar descricao, categoria ou conta"
              className="w-full sm:w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  Colunas
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {table
                  .getAllColumns()
                  .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhuma transacao encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Exibindo {table.getRowModel().rows.length} de {filteredData.length} transacoes
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Linhas
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[8, 12, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium">
              Pagina {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Primeira pagina</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Pagina anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Proxima pagina</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ultima pagina</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da transacao</DialogTitle>
            <DialogDescription>Informacoes completas da transacao selecionada.</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Descricao</span>
                <span className="text-right font-medium">{selectedTransaction.descricao}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tipo</span>
                <Badge variant="outline">
                  {selectedTransaction.tipo === "RECEITA" ? "Receita" : "Despesa"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-medium">{formatarMoeda(selectedTransaction.valor)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Data</span>
                <span>{formatarData(selectedTransaction.data)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Conta</span>
                <span>{selectedTransaction.contaNome}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Categoria</span>
                <span>{selectedTransaction.categoriaNome}</span>
              </div>
              {selectedTransaction.cardNome && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Cartao</span>
                  <span>{selectedTransaction.cardNome}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={selectedTransaction.data > new Date().toISOString().slice(0, 10) ? "outline" : "secondary"}
                >
                  {selectedTransaction.data > new Date().toISOString().slice(0, 10) ? "Agendada" : "Confirmada"}
                </Badge>
              </div>
              {selectedTransaction.observacoes && (
                <div className="grid gap-1 pt-2">
                  <span className="text-muted-foreground">Observacoes</span>
                  <p className="rounded-md border p-2">{selectedTransaction.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar transacao</DialogTitle>
            <DialogDescription>Atualize os dados principais desta transacao.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-transacao-descricao">Descricao</Label>
              <Input
                id="edit-transacao-descricao"
                value={editDescricao}
                onChange={(event) => setEditDescricao(event.target.value)}
                placeholder="Descricao da transacao"
              />
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-transacao-valor">Valor</Label>
                <Input
                  id="edit-transacao-valor"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editValor}
                  onChange={(event) => setEditValor(event.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-transacao-data">Data</Label>
                <Input
                  id="edit-transacao-data"
                  type="date"
                  value={editData}
                  onChange={(event) => setEditData(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-transacao-observacoes">Observacoes</Label>
              <Input
                id="edit-transacao-observacoes"
                value={editObservacoes}
                onChange={(event) => setEditObservacoes(event.target.value)}
                placeholder="Detalhes adicionais (opcional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={isSavingEdit}>
              {isSavingEdit ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transacao</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir &quot;{selectedTransaction?.descricao}&quot;? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
