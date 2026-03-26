'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, History, Pencil, Play, Plus, Repeat, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Empty } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { PageErrorAlert } from '@/components/shared/page-error-alert'
import { PageLoading } from '@/components/shared/page-loading'

import { formatarData, formatarDataHora, formatarMoeda, tratarErro } from '@/lib/utils'
import recorrenciaService from '@/services/recorrencia-service'
import contaService from '@/services/conta-service'
import categoriaService from '@/services/categoria-service'
import cartaoService from '@/services/cartao-service'
import type {
  CriarRecorrenciaRequest,
  FrequenciaRecorrencia,
  ResumoCartao,
  ResumoCategoria,
  ResumoConta,
  ResumoRecorrencia,
  TipoTransacao,
} from '@/types'

const frequencias = [
  'DIARIA',
  'SEMANAL',
  'QUINZENAL',
  'MENSAL',
  'BIMESTRAL',
  'TRIMESTRAL',
  'SEMESTRAL',
  'ANUAL',
] as const

const optionalNumber = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }, z.number().optional())

const recorrenciaSchema = z
  .object({
    nome: z.string().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
    descricao: z.string().max(300, 'Descricao deve ter no maximo 300 caracteres').optional(),
    tipo: z.enum(['RECEITA', 'DESPESA']),
    valor: z.preprocess((value) => Number(value), z.number().positive('Valor deve ser maior que zero')),
    frequencia: z.enum(frequencias),
    diaCobranca: optionalNumber(),
    dataInicio: z.string().min(1, 'Data de inicio e obrigatoria'),
    dataFim: z.string().optional(),
    accountId: z.preprocess((value) => Number(value), z.number().positive('Conta e obrigatoria')),
    categoryId: optionalNumber(),
    cardId: optionalNumber(),
  })
  .superRefine((value, ctx) => {
    if (value.diaCobranca !== undefined && (value.diaCobranca < 1 || value.diaCobranca > 31)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Dia de cobranca deve estar entre 1 e 31',
        path: ['diaCobranca'],
      })
    }

    if (value.dataFim && value.dataFim < value.dataInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data fim deve ser igual ou posterior a data de inicio',
        path: ['dataFim'],
      })
    }
  })

type RecorrenciaFormData = z.infer<typeof recorrenciaSchema>

const badgeAtivo = (ativo: boolean): 'secondary' | 'outline' => (ativo ? 'secondary' : 'outline')

export default function AssinaturasPage() {
  const [recorrencias, setRecorrencias] = useState<ResumoRecorrencia[]>([])
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [categorias, setCategorias] = useState<ResumoCategoria[]>([])
  const [cartoes, setCartoes] = useState<ResumoCartao[]>([])

  const [historico, setHistorico] = useState<ResumoRecorrencia['id'] | null>(null)
  const [historicoTransacoes, setHistoricoTransacoes] = useState<
    { id: number; descricao: string; data: string; valor: number; tipo: TipoTransacao }[]
  >([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<'TODAS' | 'ATIVAS' | 'INATIVAS'>('TODAS')

  const [paginaAtual, setPaginaAtual] = useState(0)
  const tamanhoPagina = 8

  const [selectedRecorrencia, setSelectedRecorrencia] = useState<ResumoRecorrencia | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [executandoId, setExecutandoId] = useState<number | null>(null)
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecorrenciaFormData>({
    resolver: zodResolver(recorrenciaSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'DESPESA',
      valor: 0,
      frequencia: 'MENSAL',
      diaCobranca: undefined,
      dataInicio: '',
      dataFim: '',
      accountId: 0,
      categoryId: undefined,
      cardId: undefined,
    },
  })

  const tipoSelecionado = watch('tipo')

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const ativoParam = filtroAtivo === 'TODAS' ? undefined : filtroAtivo === 'ATIVAS'

      const [recorrenciasRes, contasRes, categoriasRes, cartoesRes] = await Promise.all([
        recorrenciaService.listar(ativoParam),
        contaService.listar(),
        categoriaService.listar(),
        cartaoService.listar(),
      ])

      setRecorrencias(recorrenciasRes)
      setContas(contasRes)
      setCategorias(categoriasRes)
      setCartoes(cartoesRes)
    } catch (err) {
      setRecorrencias([])
      setContas([])
      setCategorias([])
      setCartoes([])
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filtroAtivo])

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((categoria) => categoria.tipo === tipoSelecionado)
  }, [categorias, tipoSelecionado])

  const recorrenciasFiltradas = useMemo(() => {
    const term = busca.trim().toLowerCase()

    return recorrencias.filter((recorrencia) => {
      if (!term) return true
      return (
        recorrencia.nome.toLowerCase().includes(term) ||
        (recorrencia.descricao || '').toLowerCase().includes(term) ||
        recorrencia.accountNome.toLowerCase().includes(term) ||
        (recorrencia.categoryNome || '').toLowerCase().includes(term) ||
        (recorrencia.cardNome || '').toLowerCase().includes(term)
      )
    })
  }, [busca, recorrencias])

  const totalPaginas = Math.max(1, Math.ceil(recorrenciasFiltradas.length / tamanhoPagina))
  const recorrenciasPaginadas = recorrenciasFiltradas.slice(
    paginaAtual * tamanhoPagina,
    paginaAtual * tamanhoPagina + tamanhoPagina
  )

  const handleOpenCreate = () => {
    setSelectedRecorrencia(null)
    reset({
      nome: '',
      descricao: '',
      tipo: 'DESPESA',
      valor: 0,
      frequencia: 'MENSAL',
      diaCobranca: undefined,
      dataInicio: '',
      dataFim: '',
      accountId: contas[0]?.id || 0,
      categoryId: undefined,
      cardId: undefined,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (recorrencia: ResumoRecorrencia) => {
    setSelectedRecorrencia(recorrencia)
    reset({
      nome: recorrencia.nome,
      descricao: recorrencia.descricao || '',
      tipo: recorrencia.tipo,
      valor: recorrencia.valor,
      frequencia: recorrencia.frequencia,
      diaCobranca: recorrencia.diaCobranca,
      dataInicio: recorrencia.dataInicio,
      dataFim: recorrencia.dataFim || '',
      accountId: recorrencia.accountId,
      categoryId: recorrencia.categoryId,
      cardId: recorrencia.cardId,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: RecorrenciaFormData) => {
    setIsSubmitting(true)
    setError(null)

    const payload: CriarRecorrenciaRequest = {
      nome: data.nome,
      descricao: data.descricao || undefined,
      tipo: data.tipo,
      valor: data.valor,
      frequencia: data.frequencia,
      diaCobranca: data.diaCobranca,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim || undefined,
      accountId: data.accountId,
      categoryId: data.categoryId,
      cardId: data.cardId,
    }

    try {
      if (selectedRecorrencia) {
        await recorrenciaService.atualizar(selectedRecorrencia.id, payload)
      } else {
        await recorrenciaService.criar(payload)
      }

      setIsDialogOpen(false)
      await fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDelete = (recorrencia: ResumoRecorrencia) => {
    setSelectedRecorrencia(recorrencia)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedRecorrencia) return

    setIsDeleting(true)
    setError(null)

    try {
      await recorrenciaService.excluir(selectedRecorrencia.id)
      setIsDeleteDialogOpen(false)
      await fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExecutar = async (id: number) => {
    setExecutandoId(id)
    setError(null)

    try {
      await recorrenciaService.executar(id)
      await fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setExecutandoId(null)
    }
  }

  const handleOpenHistorico = async (recorrencia: ResumoRecorrencia) => {
    setSelectedRecorrencia(recorrencia)
    setIsHistoricoDialogOpen(true)
    setIsLoadingHistorico(true)
    setError(null)

    try {
      const result = await recorrenciaService.historico(recorrencia.id)
      setHistorico(recorrencia.id)
      setHistoricoTransacoes(
        result.transacoes.map((item) => ({
          id: item.id,
          descricao: item.descricao,
          data: item.data,
          valor: item.valor,
          tipo: item.tipo,
        }))
      )
    } catch (err) {
      setHistorico(null)
      setHistoricoTransacoes([])
      setError(tratarErro(err))
    } finally {
      setIsLoadingHistorico(false)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie recorrencias, execucao manual e historico</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          Nova Recorrencia
        </Button>
      </div>

      {error && <PageErrorAlert message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>Recorrencias</CardTitle>
          <CardDescription>{recorrenciasFiltradas.length} item(ns) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar por nome, descricao, conta, categoria ou cartao"
                value={busca}
                onChange={(event) => {
                  setBusca(event.target.value)
                  setPaginaAtual(0)
                }}
              />
            </div>
            <Select
              value={filtroAtivo}
              onValueChange={(value) => {
                setFiltroAtivo(value as 'TODAS' | 'ATIVAS' | 'INATIVAS')
                setPaginaAtual(0)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="ATIVAS">Ativas</SelectItem>
                <SelectItem value="INATIVAS">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recorrenciasPaginadas.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <Repeat className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhuma recorrencia encontrada</Empty.Title>
              <Empty.Description>Ajuste os filtros ou crie uma nova recorrencia.</Empty.Description>
              <Empty.Actions>
                <Button onClick={handleOpenCreate}>
                  <Plus className="size-4" />
                  Nova Recorrencia
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Frequencia</TableHead>
                    <TableHead>Proxima execucao</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recorrenciasPaginadas.map((recorrencia) => (
                    <TableRow key={recorrencia.id}>
                      <TableCell>
                        <p className="font-medium">{recorrencia.nome}</p>
                        <p className="text-xs text-muted-foreground">{recorrencia.accountNome}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{recorrencia.tipo}</Badge>
                      </TableCell>
                      <TableCell>{formatarMoeda(recorrencia.valor)}</TableCell>
                      <TableCell>{recorrencia.frequencia}</TableCell>
                      <TableCell>{formatarData(recorrencia.proximaExecucao)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={badgeAtivo(recorrencia.ativo)}>{recorrencia.ativo ? 'ATIVA' : 'INATIVA'}</Badge>
                          {recorrencia.ultimaFalha && (
                            <Badge variant="destructive" title={recorrencia.motivoFalha || ''}>
                              FALHA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecutar(recorrencia.id)}
                            disabled={executandoId === recorrencia.id}
                          >
                            {executandoId === recorrencia.id ? <Spinner className="mr-2" /> : <Play className="size-4" />}
                            Executar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenHistorico(recorrencia)}>
                            <History className="size-4" />
                            Historico
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(recorrencia)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(recorrencia)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPaginas > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pagina {paginaAtual + 1} de {totalPaginas}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={paginaAtual === 0}
                      onClick={() => setPaginaAtual((prev) => Math.max(0, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={paginaAtual >= totalPaginas - 1}
                      onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas - 1, prev + 1))}
                    >
                      Proxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRecorrencia ? 'Editar Recorrencia' : 'Nova Recorrencia'}</DialogTitle>
            <DialogDescription>
              {selectedRecorrencia ? 'Atualize os dados da recorrencia' : 'Defina tipo, frequencia e vinculacoes'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Nome</FieldLabel>
                <Input id="nome" placeholder="Ex: Mensalidade academia" {...register('nome')} />
                <FieldError errors={[errors.nome]} />
              </Field>

              <Field data-invalid={!!errors.descricao}>
                <FieldLabel htmlFor="descricao">Descricao (opcional)</FieldLabel>
                <Textarea id="descricao" rows={2} placeholder="Detalhes da recorrencia" {...register('descricao')} />
                <FieldError errors={[errors.descricao]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.tipo}>
                  <FieldLabel>Tipo</FieldLabel>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECEITA">RECEITA</SelectItem>
                          <SelectItem value="DESPESA">DESPESA</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.tipo]} />
                </Field>

                <Field data-invalid={!!errors.valor}>
                  <FieldLabel htmlFor="valor">Valor</FieldLabel>
                  <Input id="valor" type="number" step="0.01" min="0.01" {...register('valor')} />
                  <FieldError errors={[errors.valor]} />
                </Field>

                <Field data-invalid={!!errors.frequencia}>
                  <FieldLabel>Frequencia</FieldLabel>
                  <Controller
                    name="frequencia"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencias.map((frequencia) => (
                            <SelectItem key={frequencia} value={frequencia}>
                              {frequencia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.frequencia]} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.diaCobranca}>
                  <FieldLabel htmlFor="diaCobranca">Dia de cobranca (opcional)</FieldLabel>
                  <Input id="diaCobranca" type="number" min="1" max="31" {...register('diaCobranca')} />
                  <FieldError errors={[errors.diaCobranca]} />
                </Field>

                <Field data-invalid={!!errors.dataInicio}>
                  <FieldLabel htmlFor="dataInicio">Data inicio</FieldLabel>
                  <Input id="dataInicio" type="date" {...register('dataInicio')} />
                  <FieldError errors={[errors.dataInicio]} />
                </Field>

                <Field data-invalid={!!errors.dataFim}>
                  <FieldLabel htmlFor="dataFim">Data fim (opcional)</FieldLabel>
                  <Input id="dataFim" type="date" {...register('dataFim')} />
                  <FieldError errors={[errors.dataFim]} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={!!errors.accountId}>
                  <FieldLabel>Conta</FieldLabel>
                  <Controller
                    name="accountId"
                    control={control}
                    render={({ field }) => (
                      <Select value={String(field.value || '')} onValueChange={(value) => field.onChange(Number(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {contas.filter((conta) => conta.ativo).map((conta) => (
                            <SelectItem key={conta.id} value={String(conta.id)}>
                              {conta.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.accountId]} />
                </Field>

                <Field data-invalid={!!errors.categoryId}>
                  <FieldLabel>Categoria (opcional)</FieldLabel>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : 'NONE'}
                        onValueChange={(value) => field.onChange(value === 'NONE' ? undefined : Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Nenhuma</SelectItem>
                          {categoriasFiltradas.map((categoria) => (
                            <SelectItem key={categoria.id} value={String(categoria.id)}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.categoryId]} />
                </Field>

                <Field data-invalid={!!errors.cardId}>
                  <FieldLabel>Cartao (opcional)</FieldLabel>
                  <Controller
                    name="cardId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : 'NONE'}
                        onValueChange={(value) => field.onChange(value === 'NONE' ? undefined : Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Nenhum</SelectItem>
                          {cartoes.filter((cartao) => cartao.ativo).map((cartao) => (
                            <SelectItem key={cartao.id} value={String(cartao.id)}>
                              {cartao.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.cardId]} />
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2" />}
                {selectedRecorrencia ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historico da Recorrencia</DialogTitle>
            <DialogDescription>
              {selectedRecorrencia ? `Lancamentos da recorrencia "${selectedRecorrencia.nome}"` : 'Historico'}
            </DialogDescription>
          </DialogHeader>

          {isLoadingHistorico ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : historico === selectedRecorrencia?.id ? (
            historicoTransacoes.length === 0 ? (
              <Empty>
                <Empty.Icon>
                  <AlertCircle className="size-8" />
                </Empty.Icon>
                <Empty.Title>Nenhuma transacao no historico</Empty.Title>
                <Empty.Description>Esta recorrencia ainda nao gerou transacoes.</Empty.Description>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoTransacoes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>#{item.id}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.tipo}</Badge>
                      </TableCell>
                      <TableCell>{formatarData(item.data)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.tipo === 'RECEITA' ? '+' : '-'} {formatarMoeda(item.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            <p className="text-sm text-muted-foreground">Nao foi possivel carregar o historico.</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recorrencia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a recorrencia &quot;{selectedRecorrencia?.nome}&quot;? Esta acao nao pode ser desfeita.
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

      {recorrencias.some((item) => item.ultimaFalha) && (
        <Card>
          <CardHeader>
            <CardTitle>Falhas recentes</CardTitle>
            <CardDescription>Recorrencias com falha na ultima execucao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recorrencias
              .filter((item) => item.ultimaFalha)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <p className="font-medium">{item.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.motivoFalha || 'Sem detalhe'} - {item.ultimaFalha ? formatarDataHora(item.ultimaFalha) : '-'}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
