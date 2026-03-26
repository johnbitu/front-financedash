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
import cartaoService from '@/services/cartao-service'
import type {
  ResumoTransacao,
  ResumoConta,
  ResumoCategoria,
  ResumoCartao,
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
    .min(1, 'DescriÃ§Ã£o Ã© obrigatÃ³ria')
    .min(3, 'DescriÃ§Ã£o deve ter no mÃ­nimo 3 caracteres')
    .max(200, 'DescriÃ§Ã£o deve ter no mÃ¡ximo 200 caracteres'),
  valor: z
    .number({ invalid_type_error: 'Valor Ã© obrigatÃ³rio' })
    .positive('Valor deve ser maior que zero'),
  tipo: z.enum(['RECEITA', 'DESPESA'], {
    required_error: 'Tipo Ã© obrigatÃ³rio',
  }),
  data: z.date({ required_error: 'Data Ã© obrigatÃ³ria' }),
  contaId: z.number({ required_error: 'Conta Ã© obrigatÃ³ria' }).positive('Selecione uma conta'),
  categoriaId: z.number({ required_error: 'Categoria Ã© obrigatÃ³ria' }).positive('Selecione uma categoria'),
  cartaoId: z.number().positive('Selecione um cartao valido').optional(),
  observacoes: z.string().max(500, 'ObservaÃ§Ãµes devem ter no mÃ¡ximo 500 caracteres').optional(),
})

type TransacaoFormData = z.infer<typeof transacaoSchema>


export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<ResumoTransacao[]>([])
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [categorias, setCategorias] = useState<ResumoCategoria[]>([])
  const [cartoes, setCartoes] = useState<ResumoCartao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // PaginaÃ§Ã£o
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
      cartaoId: undefined,
      observacoes: '',
    },
  })

  const tipoSelecionado = watch('tipo')
  const contaSelecionadaId = watch('contaId')
  const cartaoSelecionadoId = watch('cartaoId')

  // Filtra categorias pelo tipo selecionado
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipoSelecionado)
  const cartoesVinculadosConta = cartoes.filter(
    (cartao) => cartao.ativo && cartao.accountId === contaSelecionadaId
  )

  useEffect(() => {
    if (!contaSelecionadaId || contaSelecionadaId <= 0) {
      if (cartaoSelecionadoId !== undefined) {
        setValue('cartaoId', undefined)
      }
      return
    }

    const cartaoAtualAindaVinculado = cartoesVinculadosConta.some(
      (cartao) => cartao.id === cartaoSelecionadoId
    )

    if (cartaoAtualAindaVinculado) return

    const primeiroCartaoVinculado = cartoesVinculadosConta[0]?.id
    const proximoCartaoId = primeiroCartaoVinculado ?? undefined

    if (cartaoSelecionadoId !== proximoCartaoId) {
      setValue('cartaoId', proximoCartaoId)
    }
  }, [contaSelecionadaId, cartaoSelecionadoId, cartoesVinculadosConta, setValue])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [transacoesRes, contasRes, categoriasRes, cartoesRes] = await Promise.all([
        transacaoService.listar({ ...filtros, page: paginaAtual, size: tamanhoPagina }),
        contaService.listar(),
        categoriaService.listar(),
        cartaoService.listar(),
      ])

      setTransacoes(transacoesRes.content)
      setTotalPaginas(transacoesRes.totalPages)
      setTotalItens(transacoesRes.totalElements)
      setContas(contasRes)
      setCategorias(categoriasRes)
      setCartoes(cartoesRes)
    } catch (err) {
      setTransacoes([])
      setTotalPaginas(1)
      setTotalItens(0)
      setContas([])
      setCategorias([])
      setCartoes([])
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }, [filtros, paginaAtual])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenCreate = useCallback(() => {
    setSelectedTransacao(null)
    reset({
      descricao: '',
      valor: 0,
      tipo: 'DESPESA',
      data: new Date(),
      contaId: contas[0]?.id || 0,
      categoriaId: 0,
      cartaoId: undefined,
      observacoes: '',
    })
    setIsDialogOpen(true)
  }, [contas, reset])

  useEffect(() => {
    const refreshFromGlobalCreate = () => {
      void fetchData()
    }
    window.addEventListener('transaction-created', refreshFromGlobalCreate)
    return () => {
      window.removeEventListener('transaction-created', refreshFromGlobalCreate)
    }
  }, [fetchData])

  const handleOpenEdit = (transacao: ResumoTransacao) => {
    setSelectedTransacao(transacao)
    reset({
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      data: new Date(transacao.data),
      contaId: transacao.contaId,
      categoriaId: transacao.categoriaId,
      cartaoId: transacao.cardId,
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
        cardId: data.cartaoId,
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
          <h1 className="text-2xl font-bold">TransaÃ§Ãµes</h1>
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
            Nova TransaÃ§Ã£o
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
                <label className="mb-1 block text-sm font-medium">Data InÃ­cio</label>
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
          <CardTitle>Suas TransaÃ§Ãµes</CardTitle>
          <CardDescription>
            {totalItens} transaÃ§{totalItens !== 1 ? 'Ãµes' : 'Ã£o'} encontrada{totalItens !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transacoes.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <AlertCircle className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhuma transaÃ§Ã£o encontrada</Empty.Title>
              <Empty.Description>
                {temFiltrosAtivos
                  ? 'Nenhuma transaÃ§Ã£o corresponde aos filtros aplicados.'
                  : 'Registre sua primeira transaÃ§Ã£o para comeÃ§ar a controlar suas finanÃ§as.'}
              </Empty.Description>
              <Empty.Actions>
                {temFiltrosAtivos ? (
                  <Button variant="outline" onClick={handleLimparFiltros}>
                    Limpar Filtros
                  </Button>
                ) : (
                  <Button onClick={handleOpenCreate}>
                    <Plus className="size-4" />
                    Nova TransaÃ§Ã£o
                  </Button>
                )}
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DescriÃ§Ã£o</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">AÃ§Ãµes</TableHead>
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
                              aria-label="Editar transaÃ§Ã£o"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenDelete(transacao)}
                              aria-label="Excluir transaÃ§Ã£o"
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

              {/* PaginaÃ§Ã£o */}
              {totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    PÃ¡gina {paginaAtual + 1} de {totalPaginas}
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
                      PrÃ³xima
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
              {selectedTransacao ? 'Editar TransaÃ§Ã£o' : 'Nova TransaÃ§Ã£o'}
            </DialogTitle>
            <DialogDescription>
              {selectedTransacao
                ? 'Altere as informaÃ§Ãµes da transaÃ§Ã£o'
                : 'Preencha os dados para registrar uma nova transaÃ§Ã£o'}
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
                <FieldLabel htmlFor="descricao">DescriÃ§Ã£o</FieldLabel>
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

              <Field data-invalid={!!errors.cartaoId}>
                <FieldLabel>Cartao (opcional)</FieldLabel>
                <Controller
                  name="cartaoId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || 'NONE'}
                      onValueChange={(v) => field.onChange(v === 'NONE' ? undefined : parseInt(v))}
                    >
                      <SelectTrigger className="w-full" aria-invalid={!!errors.cartaoId}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Nenhum cartao</SelectItem>
                        {cartoesVinculadosConta.map((cartao) => (
                          <SelectItem key={cartao.id} value={cartao.id.toString()}>
                            {cartao.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.cartaoId]} />
              </Field>
              <Field data-invalid={!!errors.observacoes}>
                <FieldLabel htmlFor="observacoes">ObservaÃ§Ãµes (opcional)</FieldLabel>
                <Textarea
                  id="observacoes"
                  placeholder="Detalhes adicionais sobre a transaÃ§Ã£o"
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

      {/* Dialog de ConfirmaÃ§Ã£o de ExclusÃ£o */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir TransaÃ§Ã£o</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transaÃ§Ã£o &quot;{selectedTransacao?.descricao}&quot;?
              Esta aÃ§Ã£o nÃ£o pode ser desfeita.
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


