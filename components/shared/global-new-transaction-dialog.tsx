'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn, tratarErro } from '@/lib/utils'
import cartaoService from '@/services/cartao-service'
import categoriaService from '@/services/categoria-service'
import contaService from '@/services/conta-service'
import transacaoService from '@/services/transacao-service'
import type {
  CriarTransacaoRequest,
  ResumoCartao,
  ResumoCategoria,
  ResumoConta,
  TipoTransacao,
} from '@/types'

const transacaoSchema = z.object({
  descricao: z.string().min(3, 'Descricao deve ter no minimo 3 caracteres').max(200, 'Descricao deve ter no maximo 200 caracteres'),
  valor: z.number({ invalid_type_error: 'Valor e obrigatorio' }).positive('Valor deve ser maior que zero'),
  tipo: z.enum(['RECEITA', 'DESPESA'], { required_error: 'Tipo e obrigatorio' }),
  data: z.date({ required_error: 'Data e obrigatoria' }),
  contaId: z.number({ required_error: 'Conta e obrigatoria' }).positive('Selecione uma conta'),
  categoriaId: z.number({ required_error: 'Categoria e obrigatoria' }).positive('Selecione uma categoria'),
  cartaoId: z.number().positive('Selecione um cartao valido').optional(),
  observacoes: z.string().max(500, 'Observacoes devem ter no maximo 500 caracteres').optional(),
})

type TransacaoFormData = z.infer<typeof transacaoSchema>

const tiposTransacao: { value: TipoTransacao; label: string; icon: typeof TrendingUp }[] = [
  { value: 'RECEITA', label: 'Receita', icon: TrendingUp },
  { value: 'DESPESA', label: 'Despesa', icon: TrendingDown },
]

export function GlobalNewTransactionDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingDependencies, setIsLoadingDependencies] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [categorias, setCategorias] = useState<ResumoCategoria[]>([])
  const [cartoes, setCartoes] = useState<ResumoCartao[]>([])

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
  const contasAtivas = useMemo(() => contas.filter((c) => c.ativo), [contas])
  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.tipo === tipoSelecionado),
    [categorias, tipoSelecionado]
  )
  const cartoesVinculadosConta = useMemo(
    () => cartoes.filter((cartao) => cartao.ativo && cartao.accountId === contaSelecionadaId),
    [cartoes, contaSelecionadaId]
  )

  useEffect(() => {
    if (!contaSelecionadaId || contaSelecionadaId <= 0) {
      if (cartaoSelecionadoId !== undefined) {
        setValue('cartaoId', undefined)
      }
      return
    }

    const cartaoAtualAindaVinculado = cartoesVinculadosConta.some((cartao) => cartao.id === cartaoSelecionadoId)
    if (cartaoAtualAindaVinculado) return

    const proximoCartaoId = cartoesVinculadosConta[0]?.id ?? undefined
    if (cartaoSelecionadoId !== proximoCartaoId) {
      setValue('cartaoId', proximoCartaoId)
    }
  }, [contaSelecionadaId, cartaoSelecionadoId, cartoesVinculadosConta, setValue])

  const loadDependencies = useCallback(async () => {
    const [contasRes, categoriasRes, cartoesRes] = await Promise.all([
      contaService.listar(),
      categoriaService.listar(),
      cartaoService.listar(),
    ])
    setContas(contasRes)
    setCategorias(categoriasRes)
    setCartoes(cartoesRes)
    return contasRes
  }, [])

  const openCreateModal = useCallback(async () => {
    setError(null)
    setIsOpen(true)
    setIsLoadingDependencies(true)
    try {
      const contasRes = await loadDependencies()
      const contaDefault = contasRes.find((c) => c.ativo)?.id ?? contasRes[0]?.id ?? 0
      reset({
        descricao: '',
        valor: 0,
        tipo: 'DESPESA',
        data: new Date(),
        contaId: contaDefault,
        categoriaId: 0,
        cartaoId: undefined,
        observacoes: '',
      })
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsLoadingDependencies(false)
    }
  }, [loadDependencies, reset])

  useEffect(() => {
    const handleOpen = () => {
      void openCreateModal()
    }
    window.addEventListener('open-new-transaction-modal', handleOpen)
    return () => {
      window.removeEventListener('open-new-transaction-modal', handleOpen)
    }
  }, [openCreateModal])

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
      await transacaoService.criar(payload)
      setIsOpen(false)
      window.dispatchEvent(new Event('transaction-created'))
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Transacao</DialogTitle>
          <DialogDescription>Preencha os dados para registrar uma nova transacao.</DialogDescription>
        </DialogHeader>

        {isLoadingDependencies ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="mr-2" />
            <span className="text-sm text-muted-foreground">Carregando dados...</span>
          </div>
        ) : (
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
                            field.value === tipo.value && tipo.value === 'RECEITA' && 'bg-green-600 hover:bg-green-700',
                            field.value === tipo.value && tipo.value === 'DESPESA' && 'bg-red-600 hover:bg-red-700'
                          )}
                          onClick={() => {
                            field.onChange(tipo.value)
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
                <FieldLabel htmlFor="global-descricao">Descricao</FieldLabel>
                <Input
                  id="global-descricao"
                  placeholder="Ex: Compra no supermercado"
                  aria-invalid={!!errors.descricao}
                  {...register('descricao')}
                />
                <FieldError errors={[errors.descricao]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.valor}>
                  <FieldLabel htmlFor="global-valor">Valor</FieldLabel>
                  <Input
                    id="global-valor"
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
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                      <Select value={field.value?.toString() || '0'} onValueChange={(v) => field.onChange(parseInt(v, 10))}>
                        <SelectTrigger className="w-full" aria-invalid={!!errors.contaId}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {contasAtivas.map((conta) => (
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
                      <Select value={field.value?.toString() || '0'} onValueChange={(v) => field.onChange(parseInt(v, 10))}>
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
                      onValueChange={(v) => field.onChange(v === 'NONE' ? undefined : parseInt(v, 10))}
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
                <FieldLabel htmlFor="global-observacoes">Observacoes (opcional)</FieldLabel>
                <Textarea
                  id="global-observacoes"
                  placeholder="Detalhes adicionais sobre a transacao"
                  rows={2}
                  aria-invalid={!!errors.observacoes}
                  {...register('observacoes')}
                />
                <FieldError errors={[errors.observacoes]} />
              </Field>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2" />}
                Criar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
