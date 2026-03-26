'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, CreditCard, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

import { formatarData, formatarMoeda, tratarErro } from '@/lib/utils'
import cartaoService from '@/services/cartao-service'
import contaService from '@/services/conta-service'
import type {
  BandeiraCartao,
  CriarCartaoRequest,
  ResumoCartao,
  ResumoConta,
  ResumoFaturaCartao,
  StatusFatura,
  TipoCartao,
} from '@/types'

const bandeiras = ['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD', 'OUTRO'] as const
const tiposCartao = ['CREDITO', 'DEBITO'] as const

const optionalNumber = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }, z.number().optional())

const cartaoSchema = z
  .object({
    nome: z.string().min(1, 'Nome e obrigatorio').max(100, 'Nome deve ter no maximo 100 caracteres'),
    bandeira: z.enum(bandeiras),
    tipo: z.enum(tiposCartao),
    accountId: optionalNumber(),
    limite: optionalNumber(),
    diaFechamento: optionalNumber(),
    diaVencimento: optionalNumber(),
  })
  .superRefine((value, ctx) => {
    if (value.tipo === 'CREDITO') {
      if (value.limite === undefined || value.limite <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Limite e obrigatorio para cartao de credito',
          path: ['limite'],
        })
      }
      if (value.diaFechamento === undefined || value.diaFechamento < 1 || value.diaFechamento > 31) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dia de fechamento deve estar entre 1 e 31',
          path: ['diaFechamento'],
        })
      }
      if (value.diaVencimento === undefined || value.diaVencimento < 1 || value.diaVencimento > 31) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dia de vencimento deve estar entre 1 e 31',
          path: ['diaVencimento'],
        })
      }
    }
  })

type CartaoFormData = z.infer<typeof cartaoSchema>

const badgeFatura = (status: StatusFatura): 'outline' | 'default' | 'secondary' => {
  if (status === 'ABERTA') return 'outline'
  if (status === 'FECHADA') return 'default'
  return 'secondary'
}

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState<ResumoCartao[]>([])
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [faturas, setFaturas] = useState<ResumoFaturaCartao[]>([])
  const [faturaEncontrada, setFaturaEncontrada] = useState<ResumoFaturaCartao | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFaturas, setIsLoadingFaturas] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [buscaCartao, setBuscaCartao] = useState('')
  const [buscaFatura, setBuscaFatura] = useState('')
  const [filtroStatusFatura, setFiltroStatusFatura] = useState<'TODAS' | StatusFatura>('TODAS')
  const [buscaFaturaId, setBuscaFaturaId] = useState('')

  const [paginaCartao, setPaginaCartao] = useState(0)
  const [paginaFatura, setPaginaFatura] = useState(0)
  const tamanhoPagina = 8

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [selectedCartao, setSelectedCartao] = useState<ResumoCartao | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [invoiceActionId, setInvoiceActionId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CartaoFormData>({
    resolver: zodResolver(cartaoSchema),
    defaultValues: {
      nome: '',
      bandeira: 'VISA',
      tipo: 'CREDITO',
      accountId: undefined,
      limite: undefined,
      diaFechamento: undefined,
      diaVencimento: undefined,
    },
  })

  const tipoSelecionado = watch('tipo')

  const fetchBaseData = async () => {
    setIsLoading(true)
    try {
      const [cartoesRes, contasRes] = await Promise.all([cartaoService.listar(), contaService.listar()])
      setCartoes(cartoesRes)
      setContas(contasRes)

      const firstCardId = cartoesRes[0]?.id ?? null
      setSelectedCardId((current) => current ?? firstCardId)
    } catch (err) {
      setCartoes([])
      setContas([])
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFaturas = async (cardId: number | null) => {
    if (!cardId) {
      setFaturas([])
      setFaturaEncontrada(null)
      return
    }

    setIsLoadingFaturas(true)
    try {
      const data = await cartaoService.listarFaturas(cardId)
      setFaturas(data)
    } catch (err) {
      setFaturas([])
      setError(tratarErro(err))
    } finally {
      setIsLoadingFaturas(false)
    }
  }

  useEffect(() => {
    fetchBaseData()
  }, [])

  useEffect(() => {
    fetchFaturas(selectedCardId)
    setBuscaFaturaId('')
    setFaturaEncontrada(null)
    setPaginaFatura(0)
  }, [selectedCardId])

  const cartoesFiltrados = useMemo(() => {
    const term = buscaCartao.trim().toLowerCase()
    if (!term) return cartoes

    return cartoes.filter((cartao) => {
      return (
        cartao.nome.toLowerCase().includes(term) ||
        cartao.bandeira.toLowerCase().includes(term) ||
        cartao.tipo.toLowerCase().includes(term)
      )
    })
  }, [buscaCartao, cartoes])

  const totalPaginasCartao = Math.max(1, Math.ceil(cartoesFiltrados.length / tamanhoPagina))
  const cartoesPaginados = cartoesFiltrados.slice(
    paginaCartao * tamanhoPagina,
    paginaCartao * tamanhoPagina + tamanhoPagina
  )

  const faturasFiltradas = useMemo(() => {
    const term = buscaFatura.trim().toLowerCase()
    return faturas.filter((fatura) => {
      const matchStatus = filtroStatusFatura === 'TODAS' || fatura.status === filtroStatusFatura
      const matchTerm =
        !term ||
        fatura.cardNome.toLowerCase().includes(term) ||
        `${fatura.mesReferencia}/${fatura.anoReferencia}`.includes(term) ||
        fatura.status.toLowerCase().includes(term)

      return matchStatus && matchTerm
    })
  }, [buscaFatura, faturas, filtroStatusFatura])

  const totalPaginasFatura = Math.max(1, Math.ceil(faturasFiltradas.length / tamanhoPagina))
  const faturasPaginadas = faturasFiltradas.slice(
    paginaFatura * tamanhoPagina,
    paginaFatura * tamanhoPagina + tamanhoPagina
  )

  const handleOpenCreate = () => {
    setSelectedCartao(null)
    reset({
      nome: '',
      bandeira: 'VISA',
      tipo: 'CREDITO',
      accountId: contas[0]?.id,
      limite: undefined,
      diaFechamento: undefined,
      diaVencimento: undefined,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (cartao: ResumoCartao) => {
    setSelectedCartao(cartao)
    reset({
      nome: cartao.nome,
      bandeira: cartao.bandeira,
      tipo: cartao.tipo,
      accountId: cartao.accountId,
      limite: cartao.limite,
      diaFechamento: cartao.diaFechamento,
      diaVencimento: cartao.diaVencimento,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: CartaoFormData) => {
    setIsSubmitting(true)
    setError(null)

    const payload: CriarCartaoRequest = {
      nome: data.nome,
      bandeira: data.bandeira,
      tipo: data.tipo,
      accountId: data.accountId,
      limite: data.tipo === 'CREDITO' ? data.limite : undefined,
      diaFechamento: data.tipo === 'CREDITO' ? data.diaFechamento : undefined,
      diaVencimento: data.tipo === 'CREDITO' ? data.diaVencimento : undefined,
    }

    try {
      if (selectedCartao) {
        await cartaoService.atualizar(selectedCartao.id, payload)
      } else {
        await cartaoService.criar(payload)
      }

      setIsDialogOpen(false)
      await fetchBaseData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDelete = (cartao: ResumoCartao) => {
    setSelectedCartao(cartao)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedCartao) return

    setIsDeleting(true)
    setError(null)

    try {
      await cartaoService.excluir(selectedCartao.id)

      if (selectedCardId === selectedCartao.id) {
        setSelectedCardId(null)
      }

      setIsDeleteDialogOpen(false)
      await fetchBaseData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBuscarFaturaPorId = async () => {
    if (!selectedCardId || !buscaFaturaId.trim()) return

    setError(null)
    try {
      const invoice = await cartaoService.buscarFatura(selectedCardId, Number(buscaFaturaId))
      setFaturaEncontrada(invoice)
    } catch (err) {
      setFaturaEncontrada(null)
      setError(tratarErro(err))
    }
  }

  const handleFecharFatura = async (invoiceId: number) => {
    if (!selectedCardId) return

    setInvoiceActionId(invoiceId)
    setError(null)
    try {
      await cartaoService.fecharFatura(selectedCardId, invoiceId)
      await fetchFaturas(selectedCardId)
      await fetchBaseData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setInvoiceActionId(null)
    }
  }

  const handlePagarFatura = async (invoiceId: number) => {
    if (!selectedCardId) return

    setInvoiceActionId(invoiceId)
    setError(null)
    try {
      await cartaoService.pagarFatura(selectedCardId, invoiceId)
      await fetchFaturas(selectedCardId)
      await fetchBaseData()
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setInvoiceActionId(null)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cartoes</h1>
          <p className="text-muted-foreground">Gerencie cartoes e acompanhe faturas por cartao</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          Novo Cartao
        </Button>
      </div>

      {error && <PageErrorAlert message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>Seus Cartoes</CardTitle>
          <CardDescription>{cartoesFiltrados.length} cartao(oes) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar por nome, bandeira ou tipo"
                value={buscaCartao}
                onChange={(event) => {
                  setBuscaCartao(event.target.value)
                  setPaginaCartao(0)
                }}
              />
            </div>
          </div>

          {cartoesPaginados.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <CreditCard className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhum cartao encontrado</Empty.Title>
              <Empty.Description>
                Cadastre um cartao para comecar a controlar limites e faturas.
              </Empty.Description>
              <Empty.Actions>
                <Button onClick={handleOpenCreate}>
                  <Plus className="size-4" />
                  Novo Cartao
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Bandeira</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead className="text-right">Limite</TableHead>
                    <TableHead className="text-right">Disponivel</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartoesPaginados.map((cartao) => (
                    <TableRow
                      key={cartao.id}
                      className={selectedCardId === cartao.id ? 'bg-muted/50' : undefined}
                    >
                      <TableCell className="font-medium">{cartao.nome}</TableCell>
                      <TableCell>{cartao.bandeira}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cartao.tipo}</Badge>
                      </TableCell>
                      <TableCell>{cartao.accountNome || '-'}</TableCell>
                      <TableCell className="text-right">{cartao.limite ? formatarMoeda(cartao.limite) : '-'}</TableCell>
                      <TableCell className="text-right">
                        {cartao.limiteDisponivel !== undefined ? formatarMoeda(cartao.limiteDisponivel) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedCardId(cartao.id)}>
                            Faturas
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(cartao)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(cartao)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPaginasCartao > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pagina {paginaCartao + 1} de {totalPaginasCartao}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={paginaCartao === 0}
                      onClick={() => setPaginaCartao((prev) => Math.max(0, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={paginaCartao >= totalPaginasCartao - 1}
                      onClick={() => setPaginaCartao((prev) => Math.min(totalPaginasCartao - 1, prev + 1))}
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

      <Card>
        <CardHeader>
          <CardTitle>Faturas por Cartao</CardTitle>
          <CardDescription>
            {selectedCardId ? `Cartao selecionado: #${selectedCardId}` : 'Selecione um cartao para listar faturas'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <Input
              placeholder="Buscar por cartao, mes/ano ou status"
              value={buscaFatura}
              onChange={(event) => {
                setBuscaFatura(event.target.value)
                setPaginaFatura(0)
              }}
              disabled={!selectedCardId}
            />
            <Select
              value={filtroStatusFatura}
              onValueChange={(value) => {
                setFiltroStatusFatura(value as 'TODAS' | StatusFatura)
                setPaginaFatura(0)
              }}
              disabled={!selectedCardId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as faturas</SelectItem>
                <SelectItem value="ABERTA">Abertas</SelectItem>
                <SelectItem value="FECHADA">Fechadas</SelectItem>
                <SelectItem value="PAGA">Pagas</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Buscar por ID da fatura"
              value={buscaFaturaId}
              onChange={(event) => setBuscaFaturaId(event.target.value)}
              disabled={!selectedCardId}
            />
            <Button onClick={handleBuscarFaturaPorId} disabled={!selectedCardId || !buscaFaturaId.trim()}>
              Buscar Fatura
            </Button>
          </div>

          {faturaEncontrada && (
            <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
              <p className="text-sm font-medium">Fatura encontrada #{faturaEncontrada.id}</p>
              <p className="text-xs text-muted-foreground">
                Referencia {String(faturaEncontrada.mesReferencia).padStart(2, '0')}/{faturaEncontrada.anoReferencia} -
                {' '}
                {formatarMoeda(faturaEncontrada.valorTotal)}
              </p>
            </div>
          )}

          {isLoadingFaturas ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : !selectedCardId ? (
            <Empty>
              <Empty.Icon>
                <AlertCircle className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhum cartao selecionado</Empty.Title>
              <Empty.Description>Escolha um cartao acima para visualizar as faturas.</Empty.Description>
            </Empty>
          ) : faturasPaginadas.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <AlertCircle className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhuma fatura encontrada</Empty.Title>
              <Empty.Description>Altere os filtros ou aguarde a geracao de novas faturas.</Empty.Description>
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasPaginadas.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell>#{fatura.id}</TableCell>
                      <TableCell>
                        {String(fatura.mesReferencia).padStart(2, '0')}/{fatura.anoReferencia}
                      </TableCell>
                      <TableCell>{formatarData(fatura.dataVencimento)}</TableCell>
                      <TableCell className="text-right font-medium">{formatarMoeda(fatura.valorTotal)}</TableCell>
                      <TableCell>
                        <Badge variant={badgeFatura(fatura.status)}>{fatura.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {fatura.status === 'ABERTA' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFecharFatura(fatura.id)}
                              disabled={invoiceActionId === fatura.id}
                            >
                              {invoiceActionId === fatura.id && <Spinner className="mr-2" />}
                              Fechar
                            </Button>
                          )}
                          {fatura.status === 'FECHADA' && (
                            <Button
                              size="sm"
                              onClick={() => handlePagarFatura(fatura.id)}
                              disabled={invoiceActionId === fatura.id}
                            >
                              {invoiceActionId === fatura.id && <Spinner className="mr-2" />}
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPaginasFatura > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pagina {paginaFatura + 1} de {totalPaginasFatura}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={paginaFatura === 0}
                      onClick={() => setPaginaFatura((prev) => Math.max(0, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={paginaFatura >= totalPaginasFatura - 1}
                      onClick={() => setPaginaFatura((prev) => Math.min(totalPaginasFatura - 1, prev + 1))}
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
            <DialogTitle>{selectedCartao ? 'Editar Cartao' : 'Novo Cartao'}</DialogTitle>
            <DialogDescription>
              {selectedCartao ? 'Atualize os dados do cartao' : 'Preencha os dados para cadastrar um cartao'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Nome</FieldLabel>
                <Input id="nome" placeholder="Ex: Cartao principal" {...register('nome')} />
                <FieldError errors={[errors.nome]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.bandeira}>
                  <FieldLabel>Bandeira</FieldLabel>
                  <Controller
                    name="bandeira"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {bandeiras.map((bandeira) => (
                            <SelectItem key={bandeira} value={bandeira}>
                              {bandeira}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.bandeira]} />
                </Field>

                <Field data-invalid={!!errors.tipo}>
                  <FieldLabel>Tipo</FieldLabel>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposCartao.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.tipo]} />
                </Field>
              </div>

              <Field data-invalid={!!errors.accountId}>
                <FieldLabel>Conta vinculada (opcional)</FieldLabel>
                <Controller
                  name="accountId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : 'NONE'}
                      onValueChange={(value) => field.onChange(value === 'NONE' ? undefined : Number(value))}
                    >
                      <SelectTrigger className="w-full">
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

              {tipoSelecionado === 'CREDITO' && (
                <>
                  <Field data-invalid={!!errors.limite}>
                    <FieldLabel htmlFor="limite">Limite</FieldLabel>
                    <Input id="limite" type="number" step="0.01" min="0" {...register('limite')} />
                    <FieldError errors={[errors.limite]} />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.diaFechamento}>
                      <FieldLabel htmlFor="diaFechamento">Dia de fechamento</FieldLabel>
                      <Input id="diaFechamento" type="number" min="1" max="31" {...register('diaFechamento')} />
                      <FieldError errors={[errors.diaFechamento]} />
                    </Field>

                    <Field data-invalid={!!errors.diaVencimento}>
                      <FieldLabel htmlFor="diaVencimento">Dia de vencimento</FieldLabel>
                      <Input id="diaVencimento" type="number" min="1" max="31" {...register('diaVencimento')} />
                      <FieldError errors={[errors.diaVencimento]} />
                    </Field>
                  </div>
                </>
              )}
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2" />}
                {selectedCartao ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cartao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartao &quot;{selectedCartao?.nome}&quot;? Esta acao nao pode ser desfeita.
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
