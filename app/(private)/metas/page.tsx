'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Pencil, PiggyBank, Plus, Search, Target, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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

import { formatarData, formatarMoeda, tratarErro } from '@/lib/utils'
import metaService from '@/services/meta-service'
import contaService from '@/services/conta-service'
import type {
  CriarMetaRequest,
  ProgressoMeta,
  ResumoConta,
  ResumoMeta,
  StatusMeta,
} from '@/types'

const optionalNumber = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }, z.number().optional())

const metaSchema = z
  .object({
    nome: z.string().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
    descricao: z.string().max(300, 'Descricao deve ter no maximo 300 caracteres').optional(),
    valorAlvo: z.preprocess((value) => Number(value), z.number().positive('Valor alvo deve ser maior que zero')),
    dataInicio: z.string().min(1, 'Data de inicio e obrigatoria'),
    dataPrazo: z.string().min(1, 'Data prazo e obrigatoria'),
    accountId: optionalNumber(),
  })
  .refine((value) => value.dataPrazo >= value.dataInicio, {
    message: 'Data prazo deve ser igual ou posterior a data de inicio',
    path: ['dataPrazo'],
  })

const depositoSchema = z.object({
  valor: z.preprocess((value) => Number(value), z.number().positive('Valor deve ser maior que zero')),
})

type MetaFormData = z.infer<typeof metaSchema>
type DepositoFormData = z.infer<typeof depositoSchema>

const badgeStatusMeta = (status: StatusMeta): 'outline' | 'secondary' | 'destructive' => {
  if (status === 'CONCLUIDA') return 'secondary'
  if (status === 'EM_ANDAMENTO') return 'outline'
  return 'destructive'
}

export default function MetasPage() {
  const [metas, setMetas] = useState<ResumoMeta[]>([])
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [progressoAtual, setProgressoAtual] = useState<ProgressoMeta | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<'TODAS' | StatusMeta>('TODAS')

  const [paginaAtual, setPaginaAtual] = useState(0)
  const tamanhoPagina = 8

  const [selectedMeta, setSelectedMeta] = useState<ResumoMeta | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDepositoDialogOpen, setIsDepositoDialogOpen] = useState(false)
  const [isProgressoDialogOpen, setIsProgressoDialogOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isLoadingProgresso, setIsLoadingProgresso] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError: setFormError,
    formState: { errors },
  } = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorAlvo: 0,
      dataInicio: '',
      dataPrazo: '',
      accountId: undefined,
    },
  })

  const {
    register: registerDeposito,
    handleSubmit: handleSubmitDeposito,
    reset: resetDeposito,
    formState: { errors: depositoErrors },
  } = useForm<DepositoFormData>({
    resolver: zodResolver(depositoSchema),
    defaultValues: {
      valor: 0,
    },
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [metasRes, contasRes] = await Promise.all([
        metaService.listar(statusFiltro === 'TODAS' ? undefined : statusFiltro),
        contaService.listar(),
      ])
      setMetas(metasRes)
      setContas(contasRes)
    } catch (err) {
      setMetas([])
      setContas([])
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFiltro])

  const metasFiltradas = useMemo(() => {
    const term = busca.trim().toLowerCase()

    return metas.filter((meta) => {
      if (!term) return true
      return (
        meta.nome.toLowerCase().includes(term) ||
        (meta.descricao || '').toLowerCase().includes(term) ||
        (meta.accountNome || '').toLowerCase().includes(term)
      )
    })
  }, [busca, metas])

  const totalPaginas = Math.max(1, Math.ceil(metasFiltradas.length / tamanhoPagina))
  const metasPaginadas = metasFiltradas.slice(
    paginaAtual * tamanhoPagina,
    paginaAtual * tamanhoPagina + tamanhoPagina
  )

  const handleOpenCreate = () => {
    setSelectedMeta(null)
    reset({
      nome: '',
      descricao: '',
      valorAlvo: 0,
      dataInicio: '',
      dataPrazo: '',
      accountId: contas[0]?.id,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (meta: ResumoMeta) => {
    setSelectedMeta(meta)
    reset({
      nome: meta.nome,
      descricao: meta.descricao || '',
      valorAlvo: meta.valorAlvo,
      dataInicio: meta.dataInicio,
      dataPrazo: meta.dataPrazo,
      accountId: meta.accountId,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: MetaFormData) => {
    if (!selectedMeta && !data.accountId) {
      setFormError('accountId', { type: 'manual', message: 'Conta vinculada e obrigatoria na criacao da meta' })
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload: CriarMetaRequest = {
      nome: data.nome,
      descricao: data.descricao || undefined,
      valorAlvo: data.valorAlvo,
      dataInicio: data.dataInicio,
      dataPrazo: data.dataPrazo,
      accountId: data.accountId,
    }

    try {
      if (selectedMeta) {
        await metaService.atualizar(selectedMeta.id, payload)
      } else {
        await metaService.criar(payload)
      }

      setIsDialogOpen(false)
      await fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDelete = (meta: ResumoMeta) => {
    setSelectedMeta(meta)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedMeta) return

    setIsDeleting(true)
    setError(null)

    try {
      await metaService.excluir(selectedMeta.id)
      setIsDeleteDialogOpen(false)
      await fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenDeposito = (meta: ResumoMeta) => {
    setSelectedMeta(meta)
    resetDeposito({ valor: 0 })
    setIsDepositoDialogOpen(true)
  }

  const onDepositar = async (data: DepositoFormData) => {
    if (!selectedMeta) return

    setIsDepositing(true)
    setError(null)

    try {
      await metaService.depositar(selectedMeta.id, { valor: data.valor })
      setIsDepositoDialogOpen(false)
      await fetchData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsDepositing(false)
    }
  }

  const handleOpenProgresso = async (meta: ResumoMeta) => {
    setSelectedMeta(meta)
    setIsProgressoDialogOpen(true)
    setIsLoadingProgresso(true)
    setError(null)

    try {
      const progresso = await metaService.progresso(meta.id)
      setProgressoAtual(progresso)
    } catch (err) {
      setProgressoAtual(null)
      setError(tratarErro(err))
    } finally {
      setIsLoadingProgresso(false)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Metas</h1>
          <p className="text-muted-foreground">Crie metas financeiras, deposite valores e acompanhe progresso</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          Nova Meta
        </Button>
      </div>

      {error && <PageErrorAlert message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>Suas Metas</CardTitle>
          <CardDescription>{metasFiltradas.length} meta(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar por nome, descricao ou conta"
                value={busca}
                onChange={(event) => {
                  setBusca(event.target.value)
                  setPaginaAtual(0)
                }}
              />
            </div>
            <Select
              value={statusFiltro}
              onValueChange={(value) => {
                setStatusFiltro(value as 'TODAS' | StatusMeta)
                setPaginaAtual(0)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todos os status</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                <SelectItem value="CONCLUIDA">Concluida</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
                <SelectItem value="EXPIRADA">Expirada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {metasPaginadas.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <Target className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhuma meta encontrada</Empty.Title>
              <Empty.Description>Ajuste os filtros ou crie uma nova meta para comecar.</Empty.Description>
              <Empty.Actions>
                <Button onClick={handleOpenCreate}>
                  <Plus className="size-4" />
                  Nova Meta
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meta</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Atual</TableHead>
                    <TableHead className="text-right">Alvo</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metasPaginadas.map((meta) => {
                    const percentual = meta.valorAlvo > 0 ? Math.min(100, (meta.valorAtual / meta.valorAlvo) * 100) : 0
                    return (
                      <TableRow key={meta.id}>
                        <TableCell>
                          <p className="font-medium">{meta.nome}</p>
                          <p className="text-xs text-muted-foreground">Prazo: {formatarData(meta.dataPrazo)}</p>
                        </TableCell>
                        <TableCell>{meta.accountNome || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={badgeStatusMeta(meta.status)}>{meta.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatarMoeda(meta.valorAtual)}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(meta.valorAlvo)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={percentual} />
                            <p className="text-xs text-muted-foreground">{percentual.toFixed(1)}%</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDeposito(meta)}>
                              <PiggyBank className="size-4" />
                              Depositar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleOpenProgresso(meta)}>
                              Progresso
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(meta)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleOpenDelete(meta)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMeta ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
            <DialogDescription>
              {selectedMeta ? 'Atualize os dados da meta' : 'Defina objetivo, prazo e conta vinculada'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Nome</FieldLabel>
                <Input id="nome" placeholder="Ex: Reserva de emergencia" {...register('nome')} />
                <FieldError errors={[errors.nome]} />
              </Field>

              <Field data-invalid={!!errors.descricao}>
                <FieldLabel htmlFor="descricao">Descricao (opcional)</FieldLabel>
                <Textarea id="descricao" rows={2} placeholder="Detalhes sobre a meta" {...register('descricao')} />
                <FieldError errors={[errors.descricao]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.valorAlvo}>
                  <FieldLabel htmlFor="valorAlvo">Valor alvo</FieldLabel>
                  <Input id="valorAlvo" type="number" step="0.01" min="0.01" {...register('valorAlvo')} />
                  <FieldError errors={[errors.valorAlvo]} />
                </Field>

                <Field data-invalid={!!errors.accountId}>
                  <FieldLabel>Conta vinculada</FieldLabel>
                  <Controller
                    name="accountId"
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.dataInicio}>
                  <FieldLabel htmlFor="dataInicio">Data de inicio</FieldLabel>
                  <Input id="dataInicio" type="date" {...register('dataInicio')} />
                  <FieldError errors={[errors.dataInicio]} />
                </Field>

                <Field data-invalid={!!errors.dataPrazo}>
                  <FieldLabel htmlFor="dataPrazo">Data prazo</FieldLabel>
                  <Input id="dataPrazo" type="date" {...register('dataPrazo')} />
                  <FieldError errors={[errors.dataPrazo]} />
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2" />}
                {selectedMeta ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepositoDialogOpen} onOpenChange={setIsDepositoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Depositar na Meta</DialogTitle>
            <DialogDescription>Informe o valor para adicionar na meta &quot;{selectedMeta?.nome}&quot;.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDeposito(onDepositar)}>
            <FieldGroup>
              <Field data-invalid={!!depositoErrors.valor}>
                <FieldLabel htmlFor="valorDeposito">Valor</FieldLabel>
                <Input id="valorDeposito" type="number" step="0.01" min="0.01" {...registerDeposito('valor')} />
                <FieldError errors={[depositoErrors.valor]} />
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDepositoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isDepositing}>
                {isDepositing && <Spinner className="mr-2" />}
                Depositar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProgressoDialogOpen} onOpenChange={setIsProgressoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Progresso da Meta</DialogTitle>
            <DialogDescription>Resumo detalhado da meta &quot;{selectedMeta?.nome}&quot;.</DialogDescription>
          </DialogHeader>

          {isLoadingProgresso ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : progressoAtual ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Valor atual</p>
                  <p className="font-medium">{formatarMoeda(progressoAtual.valorAtual)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Valor alvo</p>
                  <p className="font-medium">{formatarMoeda(progressoAtual.valorAlvo)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Valor restante</p>
                  <p className="font-medium">{formatarMoeda(progressoAtual.valorRestante)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Dias restantes</p>
                  <p className="font-medium">{progressoAtual.diasRestantes}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Percentual concluido</span>
                  <span>{progressoAtual.percentualConcluido.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(100, progressoAtual.percentualConcluido)} />
              </div>

              <Badge variant={badgeStatusMeta(progressoAtual.status)}>{progressoAtual.status}</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nao foi possivel carregar o progresso.</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a meta &quot;{selectedMeta?.nome}&quot;? Esta acao nao pode ser desfeita.
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
