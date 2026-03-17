'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { formatarData, tratarErro, cn } from '@/lib/utils'
import categoriaService from '@/services/categoria-service'
import type { ResumoCategoria, TipoCategoria, CriarCategoriaRequest } from '@/types'

const tiposCategoria: { value: TipoCategoria; label: string; icon: typeof TrendingUp }[] = [
  { value: 'RECEITA', label: 'Receita', icon: TrendingUp },
  { value: 'DESPESA', label: 'Despesa', icon: TrendingDown },
]

const categoriaSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo: z.enum(['RECEITA', 'DESPESA'], {
    required_error: 'Tipo é obrigatório',
  }),
  descricao: z
    .string()
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .optional(),
})

type CategoriaFormData = z.infer<typeof categoriaSchema>

// Dados mock
const mockCategorias: ResumoCategoria[] = [
  { id: 1, nome: 'Salário', tipo: 'RECEITA', descricao: 'Salário mensal', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 2, nome: 'Freelance', tipo: 'RECEITA', descricao: 'Trabalhos freelance', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 3, nome: 'Investimentos', tipo: 'RECEITA', descricao: 'Rendimentos de investimentos', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 4, nome: 'Moradia', tipo: 'DESPESA', descricao: 'Aluguel, condomínio, etc', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 5, nome: 'Alimentação', tipo: 'DESPESA', descricao: 'Supermercado e restaurantes', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 6, nome: 'Transporte', tipo: 'DESPESA', descricao: 'Combustível, transporte público', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 7, nome: 'Lazer', tipo: 'DESPESA', descricao: 'Entretenimento e viagens', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
  { id: 8, nome: 'Saúde', tipo: 'DESPESA', descricao: 'Plano de saúde, medicamentos', criadoEm: '2026-01-15T10:00:00', atualizadoEm: '2026-01-15T10:00:00' },
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<ResumoCategoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | TipoCategoria>('TODAS')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<ResumoCategoria | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: '',
      tipo: 'DESPESA',
      descricao: '',
    },
  })

  const fetchCategorias = async () => {
    try {
      const data = await categoriaService.listar()
      setCategorias(data)
      setUsingMockData(false)
    } catch (err) {
      setCategorias(mockCategorias)
      setUsingMockData(true)
      setError(tratarErro(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const categoriasFiltradas = filtroTipo === 'TODAS'
    ? categorias
    : categorias.filter((c) => c.tipo === filtroTipo)

  const receitasCount = categorias.filter((c) => c.tipo === 'RECEITA').length
  const despesasCount = categorias.filter((c) => c.tipo === 'DESPESA').length

  const handleOpenCreate = () => {
    setSelectedCategoria(null)
    reset({
      nome: '',
      tipo: filtroTipo === 'TODAS' ? 'DESPESA' : filtroTipo,
      descricao: '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (categoria: ResumoCategoria) => {
    setSelectedCategoria(categoria)
    reset({
      nome: categoria.nome,
      tipo: categoria.tipo,
      descricao: categoria.descricao || '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (categoria: ResumoCategoria) => {
    setSelectedCategoria(categoria)
    setIsDeleteDialogOpen(true)
  }

  const onSubmit = async (data: CategoriaFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (selectedCategoria) {
        if (!usingMockData) {
          await categoriaService.atualizar(selectedCategoria.id, {
            nome: data.nome,
            tipo: data.tipo,
            descricao: data.descricao,
          })
        } else {
          setCategorias((prev) =>
            prev.map((c) =>
              c.id === selectedCategoria.id
                ? { ...c, nome: data.nome, tipo: data.tipo, descricao: data.descricao }
                : c
            )
          )
        }
      } else {
        if (!usingMockData) {
          await categoriaService.criar(data as CriarCategoriaRequest)
        } else {
          const novaCategoria: ResumoCategoria = {
            id: Math.max(...categorias.map((c) => c.id)) + 1,
            nome: data.nome,
            tipo: data.tipo,
            descricao: data.descricao,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          }
          setCategorias((prev) => [...prev, novaCategoria])
        }
      }

      setIsDialogOpen(false)
      if (!usingMockData) {
        fetchCategorias()
      }
    } catch (err) {
      setError(tratarErro(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategoria) return

    setIsDeleting(true)
    setError(null)

    try {
      if (!usingMockData) {
        await categoriaService.excluir(selectedCategoria.id)
      } else {
        setCategorias((prev) => prev.filter((c) => c.id !== selectedCategoria.id))
      }

      setIsDeleteDialogOpen(false)
      if (!usingMockData) {
        fetchCategorias()
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
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações por categorias
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4" />
          Nova Categoria
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
          <CardTitle>Suas Categorias</CardTitle>
          <CardDescription>
            {categorias.length} categoria{categorias.length !== 1 ? 's' : ''} cadastrada{categorias.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filtroTipo}
            onValueChange={(v) => setFiltroTipo(v as 'TODAS' | TipoCategoria)}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="TODAS">Todas ({categorias.length})</TabsTrigger>
              <TabsTrigger value="RECEITA">Receitas ({receitasCount})</TabsTrigger>
              <TabsTrigger value="DESPESA">Despesas ({despesasCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filtroTipo} className="mt-0">
              {categoriasFiltradas.length === 0 ? (
                <Empty>
                  <Empty.Icon>
                    <AlertCircle className="size-8" />
                  </Empty.Icon>
                  <Empty.Title>Nenhuma categoria encontrada</Empty.Title>
                  <Empty.Description>
                    {filtroTipo === 'TODAS'
                      ? 'Crie sua primeira categoria para começar a organizar suas transações.'
                      : `Nenhuma categoria de ${filtroTipo.toLowerCase()} cadastrada.`}
                  </Empty.Description>
                  <Empty.Actions>
                    <Button onClick={handleOpenCreate}>
                      <Plus className="size-4" />
                      Nova Categoria
                    </Button>
                  </Empty.Actions>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriasFiltradas.map((categoria) => {
                      const tipoConfig = tiposCategoria.find((t) => t.value === categoria.tipo)
                      const Icon = tipoConfig?.icon || TrendingDown

                      return (
                        <TableRow key={categoria.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'flex size-8 items-center justify-center rounded-full',
                                  categoria.tipo === 'RECEITA'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                )}
                              >
                                <Icon className="size-4" />
                              </div>
                              {categoria.nome}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                categoria.tipo === 'RECEITA'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {tipoConfig?.label || categoria.tipo}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {categoria.descricao || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatarData(categoria.criadoEm)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleOpenEdit(categoria)}
                                aria-label="Editar categoria"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleOpenDelete(categoria)}
                                aria-label="Excluir categoria"
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategoria
                ? 'Altere as informações da categoria'
                : 'Preencha os dados para criar uma nova categoria'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Nome</FieldLabel>
                <Input
                  id="nome"
                  placeholder="Ex: Alimentação"
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
                        {tiposCategoria.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <span className="flex items-center gap-2">
                              <tipo.icon
                                className={cn(
                                  'size-4',
                                  tipo.value === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                                )}
                              />
                              {tipo.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.tipo]} />
              </Field>

              <Field data-invalid={!!errors.descricao}>
                <FieldLabel htmlFor="descricao">Descrição (opcional)</FieldLabel>
                <Textarea
                  id="descricao"
                  placeholder="Descrição da categoria"
                  rows={3}
                  aria-invalid={!!errors.descricao}
                  {...register('descricao')}
                />
                <FieldError errors={[errors.descricao]} />
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
                {selectedCategoria ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria &quot;{selectedCategoria?.nome}&quot;?
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
