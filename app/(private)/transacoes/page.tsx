'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, AlertCircle, TrendingUp, TrendingDown, Filter, X } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageErrorAlert } from '@/components/shared/page-error-alert'
import { PageLoading } from '@/components/shared/page-loading'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import { formatarMoeda, formatarData, tratarErro, cn } from '@/lib/utils'
import transacaoService from '@/services/transacao-service'
import contaService from '@/services/conta-service'
import categoriaService from '@/services/categoria-service'
import type {
  ResumoTransacao,
  ResumoConta,
  ResumoCategoria,
  TipoTransacao,
  FiltroTransacao,
  CriarTransacaoRequest,
} from '@/types'

const tiposTransacao: { value: TipoTransacao; label: string; icon: typeof TrendingUp }[] = [
  { value: 'RECEITA', label: 'Receita', icon: TrendingUp },
  { value: 'DESPESA', label: 'Despesa', icon: TrendingDown },
]

const transacaoSchema = z.object({
  descricao: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z
    .number({ invalid_type_error: 'Valor é obrigatório' })
    .positive('Valor deve ser maior que zero'),
  tipo: z.enum(['RECEITA', 'DESPESA'], {
    required_error: 'Tipo é obrigatório',
  }),
  data: z.date({ required_error: 'Data é obrigatória' }),
  contaId: z.number({ required_error: 'Conta é obrigatória' }).positive('Selecione uma conta'),
  categoriaId: z.number({ required_error: 'Categoria é obrigatória' }).positive('Selecione uma categoria'),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
})

type TransacaoFormData = z.infer<typeof transacaoSchema>


export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<ResumoTransacao[]>([])
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [categorias, setCategorias] = useState<ResumoCategoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalItens, setTotalItens] = useState(0)
  const tamanhoPagina = 10

  // Filtros
  const [filtros, setFiltros] = useState<FiltroTransacao>({})
  const [showFilters, setShowFilters] = useState(false)

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTransacao, setSelectedTransacao] = useState<ResumoTransacao | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: {
      descricao: '',
      valor: 0,
      tipo: 'DESPESA',
      data: new Date(),
      contaId: 0,
      categoriaId: 0,
      observacoes: '',
    },
  })

  const tipoSelecionado = watch('tipo')

  // Filtra categorias pelo tipo selecionado
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipoSelecionado)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [transacoesRes, contasRes, categoriasRes] = await Promise.all([
        transacaoService.listar({ ...filtros, page: paginaAtual, size: tamanhoPagina }),
        contaService.listar(),
        categoriaService.listar(),
      ])

      setTransacoes(transacoesRes.content)
      setTotalPaginas(transacoesRes.totalPages)
      setTotalItens(transacoesRes.totalElements)
      setContas(contasRes)
      setCategorias(categoriasRes)
    } catch (err) {
      setTransacoes([])
      setTotalPaginas(1)
      setTotalItens(0)
      setContas([])
      setCategorias([])
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }, [filtros, paginaAtual])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenCreate = () => {
    setSelectedTransacao(null)
    reset({
      descricao: '',
      valor: 0,
      tipo: 'DESPESA',
      data: new Date(),
      contaId: contas[0]?.id || 0,
      categoriaId: 0,
      observacoes: '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (transacao: ResumoTransacao) => {
    setSelectedTransacao(transacao)
    reset({
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      data: new Date(transacao.data),
      contaId: transacao.contaId,
      categoriaId: transacao.categoriaId,
      observacoes: transacao.observacoes || '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (transacao: ResumoTransacao) => {
    setSelectedTransacao(transacao)
    setIsDeleteDialogOpen(true)
  }

  const onSubmit = async (data: TransacaoFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: CriarTransacaoRequest = {
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        data: format(data.data, 'yyyy-MM-dd'),
        contaId: data.contaId,
        categoriaId: data.categoriaId,
        observacoes: data.observacoes,
      }

      if (selectedTransacao) {
        await transacaoService.atualizar(selectedTransacao.id, payload)
      } else {
        await transacaoService.criar(payload)
      }

      setIsDialogOpen(false)
      fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTransacao) return

    setIsDeleting(true)
    setError(null)

    try {
      await transacaoService.excluir(selectedTransacao.id)

      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLimparFiltros = () => {
    setFiltros({})
    setPaginaAtual(0)
  }

  const temFiltrosAtivos = Object.keys(filtros).some(
    (key) => filtros[key as keyof FiltroTransacao] !== undefined
  )

  if (isLoading && transacoes.length === 0) {
    return <PageLoading />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe suas receitas e despesas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="size-4" />
            Filtros
            {temFiltrosAtivos && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {Object.keys(filtros).filter((k) => filtros[k as keyof FiltroTransacao] !== undefined).length}
              </span>
            )}
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      {error && (
        <PageErrorAlert message={error} />
      )}

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[150px]">
                <label className="mb-1 block text-sm font-medium">Tipo</label>
                <Select
                  value={filtros.tipo || 'TODOS'}
                  onValueChange={(v) => {
                    setFiltros((prev) => ({
                      ...prev,
                      tipo: v === 'TODOS' ? undefined : (v as TipoTransacao),
                    }))
                    setPaginaAtual(0)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    <SelectItem value="RECEITA">Receitas</SelectItem>
                    <SelectItem value="DESPESA">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[200px]">
                <label className="mb-1 block text-sm font-medium">Conta</label>
                <Select
                  value={filtros.contaId?.toString() || 'TODAS'}
                  onValueChange={(v) => {
                    setFiltros((prev) => ({
                      ...prev,
                      contaId: v === 'TODAS' ? undefined : parseInt(v),
                    }))
                    setPaginaAtual(0)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas as contas</SelectItem>
                    {contas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id.toString()}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[150px]">
                <label className="mb-1 block text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={filtros.dataInicio || ''}
                  onChange={(e) => {
                    setFiltros((prev) => ({
                      ...prev,
                      dataInicio: e.target.value || undefined,
                    }))
                    setPaginaAtual(0)
                  }}
                />
              </div>

              <div className="min-w-[150px]">
                <label className="mb-1 block text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={filtros.dataFim || ''}
                  onChange={(e) => {
                    setFiltros((prev) => ({
                      ...prev,
                      dataFim: e.target.value || undefined,
                    }))
                    setPaginaAtual(0)
                  }}
                />
              </div>

              {temFiltrosAtivos && (
                <Button variant="ghost" onClick={handleLimparFiltros}>
                  <X className="size-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Suas Transações</CardTitle>
          <CardDescription>
            {totalItens} transaç{totalItens !== 1 ? 'ões' : 'ão'} encontrada{totalItens !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transacoes.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <AlertCircle className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhuma transação encontrada</Empty.Title>
              <Empty.Description>
                {temFiltrosAtivos
                  ? 'Nenhuma transação corresponde aos filtros aplicados.'
                  : 'Registre sua primeira transação para começar a controlar suas finanças.'}
              </Empty.Description>
              <Empty.Actions>
                {temFiltrosAtivos ? (
                  <Button variant="outline" onClick={handleLimparFiltros}>
                    Limpar Filtros
                  </Button>
                ) : (
                  <Button onClick={handleOpenCreate}>
                    <Plus className="size-4" />
                    Nova Transação
                  </Button>
                )}
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoes.map((transacao) => {
                    const isReceita = transacao.tipo === 'RECEITA'
                    const Icon = isReceita ? TrendingUp : TrendingDown

                    return (
                      <TableRow key={transacao.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex size-8 items-center justify-center rounded-full',
                                isReceita
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <p className="font-medium">{transacao.descricao}</p>
                              {transacao.observacoes && (
                                <p className="max-w-xs truncate text-xs text-muted-foreground">
                                  {transacao.observacoes}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{transacao.categoriaNome}</TableCell>
                        <TableCell>{transacao.contaNome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatarData(transacao.data)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            isReceita ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {isReceita ? '+' : '-'} {formatarMoeda(transacao.valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenEdit(transacao)}
                              aria-label="Editar transação"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenDelete(transacao)}
                              aria-label="Excluir transação"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {paginaAtual + 1} de {totalPaginas}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
                      disabled={paginaAtual === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaAtual((p) => Math.min(totalPaginas - 1, p + 1))}
                      disabled={paginaAtual >= totalPaginas - 1}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTransacao ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
            <DialogDescription>
              {selectedTransacao
                ? 'Altere as informações da transação'
                : 'Preencha os dados para registrar uma nova transação'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.tipo}>
                <FieldLabel>Tipo</FieldLabel>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {tiposTransacao.map((tipo) => (
                        <Button
                          key={tipo.value}
                          type="button"
                          variant={field.value === tipo.value ? 'default' : 'outline'}
                          className={cn(
                            'flex-1',
                            field.value === tipo.value &&
                              tipo.value === 'RECEITA' &&
                              'bg-green-600 hover:bg-green-700',
                            field.value === tipo.value &&
                              tipo.value === 'DESPESA' &&
                              'bg-red-600 hover:bg-red-700'
                          )}
                          onClick={() => {
                            field.onChange(tipo.value)
                            // Limpa categoria quando muda o tipo
                            setValue('categoriaId', 0)
                          }}
                        >
                          <tipo.icon className="size-4" />
                          {tipo.label}
                        </Button>
                      ))}
                    </div>
                  )}
                />
                <FieldError errors={[errors.tipo]} />
              </Field>

              <Field data-invalid={!!errors.descricao}>
                <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                <Input
                  id="descricao"
                  placeholder="Ex: Compra no supermercado"
                  aria-invalid={!!errors.descricao}
                  {...register('descricao')}
                />
                <FieldError errors={[errors.descricao]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.valor}>
                  <FieldLabel htmlFor="valor">Valor</FieldLabel>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    aria-invalid={!!errors.valor}
                    {...register('valor', { valueAsNumber: true })}
                  />
                  <FieldError errors={[errors.valor]} />
                </Field>

                <Field data-invalid={!!errors.data}>
                  <FieldLabel>Data</FieldLabel>
                  <Controller
                    name="data"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  <FieldError errors={[errors.data]} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.contaId}>
                  <FieldLabel>Conta</FieldLabel>
                  <Controller
                    name="contaId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() || '0'}
                        onValueChange={(v) => field.onChange(parseInt(v))}
                      >
                        <SelectTrigger className="w-full" aria-invalid={!!errors.contaId}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {contas.filter((c) => c.ativo).map((conta) => (
                            <SelectItem key={conta.id} value={conta.id.toString()}>
                              {conta.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.contaId]} />
                </Field>

                <Field data-invalid={!!errors.categoriaId}>
                  <FieldLabel>Categoria</FieldLabel>
                  <Controller
                    name="categoriaId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() || '0'}
                        onValueChange={(v) => field.onChange(parseInt(v))}
                      >
                        <SelectTrigger className="w-full" aria-invalid={!!errors.categoriaId}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriasFiltradas.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id.toString()}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.categoriaId]} />
                </Field>
              </div>

              <Field data-invalid={!!errors.observacoes}>
                <FieldLabel htmlFor="observacoes">Observações (opcional)</FieldLabel>
                <Textarea
                  id="observacoes"
                  placeholder="Detalhes adicionais sobre a transação"
                  rows={2}
                  aria-invalid={!!errors.observacoes}
                  {...register('observacoes')}
                />
                <FieldError errors={[errors.observacoes]} />
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2" />}
                {selectedTransacao ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação &quot;{selectedTransacao?.descricao}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && <Spinner className="mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

