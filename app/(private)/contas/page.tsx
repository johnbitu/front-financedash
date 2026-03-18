'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'

import { formatarMoeda, formatarData, tratarErro, cn } from '@/lib/utils'
import contaService from '@/services/conta-service'
import type { ResumoConta, TipoConta, CriarContaRequest } from '@/types'

const tiposConta: { value: TipoConta; label: string }[] = [
  { value: 'CORRENTE', label: 'Conta Corrente' },
  { value: 'POUPANCA', label: 'Poupança' },
  { value: 'INVESTIMENTO', label: 'Investimento' },
  { value: 'CARTEIRA', label: 'Carteira' },
]

const contaSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo: z.enum(['CORRENTE', 'POUPANCA', 'INVESTIMENTO', 'CARTEIRA'], {
    required_error: 'Tipo é obrigatório',
  }),
  saldoInicial: z
    .number({ invalid_type_error: 'Saldo inicial é obrigatório' })
    .min(0, 'Saldo inicial não pode ser negativo'),
  ativo: z.boolean(),
})

type ContaFormData = z.infer<typeof contaSchema>

// Dados mock
const mockContas: ResumoConta[] = [
  {
    id: 1,
    nome: 'Conta Corrente Banco X',
    tipo: 'CORRENTE',
    saldoAtual: 5250.75,
    ativo: true,
    criadoEm: '2026-01-15T10:00:00',
    atualizadoEm: '2026-03-15T14:30:00',
  },
  {
    id: 2,
    nome: 'Poupança',
    tipo: 'POUPANCA',
    saldoAtual: 15000.0,
    ativo: true,
    criadoEm: '2026-01-20T10:00:00',
    atualizadoEm: '2026-03-10T09:00:00',
  },
  {
    id: 3,
    nome: 'Carteira Física',
    tipo: 'CARTEIRA',
    saldoAtual: 350.0,
    ativo: true,
    criadoEm: '2026-02-01T10:00:00',
    atualizadoEm: '2026-03-17T16:00:00',
  },
]

export default function ContasPage() {
  const [contas, setContas] = useState<ResumoConta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedConta, setSelectedConta] = useState<ResumoConta | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContaFormData>({
    resolver: zodResolver(contaSchema),
    defaultValues: {
      nome: '',
      tipo: 'CORRENTE',
      saldoInicial: 0,
      ativo: true,
    },
  })

  const fetchContas = async () => {
    try {
      const data = await contaService.listar()
      setContas(data)
      setUsingMockData(false)
    } catch (err) {
      setContas(mockContas)
      setUsingMockData(true)
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContas()
  }, [])

  const handleOpenCreate = () => {
    setSelectedConta(null)
    reset({
      nome: '',
      tipo: 'CORRENTE',
      saldoInicial: 0,
      ativo: true,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (conta: ResumoConta) => {
    setSelectedConta(conta)
    reset({
      nome: conta.nome,
      tipo: conta.tipo,
      saldoInicial: conta.saldoAtual,
      ativo: conta.ativo,
    })
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (conta: ResumoConta) => {
    setSelectedConta(conta)
    setIsDeleteDialogOpen(true)
  }

  const onSubmit = async (data: ContaFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (selectedConta) {
        // Atualizar
        if (!usingMockData) {
          await contaService.atualizar(selectedConta.id, {
            nome: data.nome,
            tipo: data.tipo,
            saldoInicial: data.saldoInicial,
            ativo:data.ativo,
          })
        } else {
          // Mock update
          setContas((prev) =>
            prev.map((c) =>
              c.id === selectedConta.id
                ? { ...c, nome: data.nome, tipo: data.tipo, ativo: data.ativo }
                : c
            )
          )
        }
      } else {
        // Criar
        if (!usingMockData) {
          const payload: CriarContaRequest = {
            nome: data.nome,
            tipo: data.tipo,
            saldoInicial: data.saldoInicial,
            ativo: data.ativo,
          }
          await contaService.criar(payload)
        } else {
          // Mock create
          const novaConta: ResumoConta = {
            id: Math.max(...contas.map((c) => c.id)) + 1,
            nome: data.nome,
            tipo: data.tipo,
            saldoAtual: data.saldoInicial,
            ativo: data.ativo,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          }
          setContas((prev) => [...prev, novaConta])
        }
      }

      setIsDialogOpen(false)
      if (!usingMockData) {
        fetchContas()
      }
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedConta) return

    setIsDeleting(true)
    setError(null)

    try {
      if (!usingMockData) {
        await contaService.excluir(selectedConta.id)
      } else {
        // Mock delete
        setContas((prev) => prev.filter((c) => c.id !== selectedConta.id))
      }

      setIsDeleteDialogOpen(false)
      if (!usingMockData) {
        fetchContas()
      }
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e carteiras
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          Nova Conta
        </Button>
      </div>

      {usingMockData && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Exibindo dados de demonstração. Conecte ao backend para ver seus dados reais.
          </AlertDescription>
        </Alert>
      )}

      {error && !usingMockData && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Suas Contas</CardTitle>
          <CardDescription>
            {contas.length} conta{contas.length !== 1 ? 's' : ''} cadastrada{contas.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contas.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <AlertCircle className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhuma conta cadastrada</Empty.Title>
              <Empty.Description>
                Crie sua primeira conta para começar a gerenciar suas finanças.
              </Empty.Description>
              <Empty.Actions>
                <Button onClick={handleOpenCreate}>
                  <Plus className="size-4" />
                  Nova Conta
                </Button>
              </Empty.Actions>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Saldo Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.nome}</TableCell>
                    <TableCell>
                      {tiposConta.find((t) => t.value === conta.tipo)?.label || conta.tipo}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        conta.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatarMoeda(conta.saldoAtual)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          conta.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {conta.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatarData(conta.atualizadoEm)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(conta)}
                          aria-label="Editar conta"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDelete(conta)}
                          aria-label="Excluir conta"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedConta ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              {selectedConta
                ? 'Altere as informações da conta'
                : 'Preencha os dados para criar uma nova conta'}
            </DialogDescription>
          </DialogHeader>

	          <form onSubmit={handleSubmit(onSubmit)}>
	            {selectedConta && (
	              <input type="hidden" {...register('saldoInicial', { valueAsNumber: true })} />
	            )}
	            <FieldGroup>
              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Nome</FieldLabel>
                <Input
                  id="nome"
                  placeholder="Ex: Conta Corrente Banco X"
                  aria-invalid={!!errors.nome}
                  {...register('nome')}
                />
                <FieldError errors={[errors.nome]} />
              </Field>

              <Field data-invalid={!!errors.tipo}>
                <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" aria-invalid={!!errors.tipo}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposConta.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.tipo]} />
              </Field>

              {!selectedConta && (
                <Field data-invalid={!!errors.saldoInicial}>
                  <FieldLabel htmlFor="saldoInicial">Saldo Inicial</FieldLabel>
                  <Input
                    id="saldoInicial"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    aria-invalid={!!errors.saldoInicial}
                    {...register('saldoInicial', { valueAsNumber: true })}
                  />
                  <FieldError errors={[errors.saldoInicial]} />
                </Field>
              )}

              <Field orientation="horizontal">
                <FieldLabel htmlFor="ativo">Conta Ativa</FieldLabel>
                <Controller
                  name="ativo"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="ativo"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
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
                {selectedConta ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta &quot;{selectedConta?.nome}&quot;?
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
