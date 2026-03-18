'use client'

import { useEffect, useState } from 'react'
import { Shield, User, Users } from 'lucide-react'

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
import { Empty } from '@/components/ui/empty'
import { PageErrorAlert } from '@/components/shared/page-error-alert'
import { PageLoading } from '@/components/shared/page-loading'

import { formatarDataHora, tratarErro } from '@/lib/utils'
import usuarioService from '@/services/usuario-service'
import type { UserInfo, Role } from '@/types'

const rolesConfig: Record<Role, { label: string; icon: typeof Shield; iconClassName: string }> = {
  ADMIN: {
    label: 'Administrador',
    icon: Shield,
    iconClassName: 'text-amber-600',
  },
  USUARIO: {
    label: 'Usuario',
    icon: User,
    iconClassName: 'text-muted-foreground',
  },
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await usuarioService.listar()
        setUsuarios(data)
      } catch (err) {
        setUsuarios([])
        setError(tratarErro(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  if (isLoading) {
    return <PageLoading />
  }

  const adminsCount = usuarios.filter((u) => u.role === 'ADMIN').length
  const usuariosCount = usuarios.filter((u) => u.role === 'USUARIO').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Visualize todos os usuarios cadastrados no sistema.
        </p>
      </div>

      {error && <PageErrorAlert message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de usuarios</CardDescription>
            <CardTitle className="text-2xl">{usuarios.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Users className="size-4" />
              Cadastrados no sistema
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-2xl">{adminsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Shield className="size-4 text-amber-600" />
              Com acesso administrativo
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Usuarios comuns</CardDescription>
            <CardTitle className="text-2xl">{usuariosCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <User className="size-4" />
              Sem privilegios de admin
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Lista de usuarios</CardTitle>
            <CardDescription>
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} cadastrado
              {usuarios.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            {usuarios.length} registro{usuarios.length !== 1 ? 's' : ''}
          </Badge>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <User className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhum usuario encontrado</Empty.Title>
              <Empty.Description>
                Nao ha usuarios cadastrados no sistema.
              </Empty.Description>
            </Empty>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-40">Perfil</TableHead>
                    <TableHead className="w-44">Cadastrado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => {
                    const roleConfig = rolesConfig[usuario.role]
                    const Icon = roleConfig.icon

                    return (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-mono text-muted-foreground align-middle">
                          #{usuario.id}
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                              <User className="size-4" />
                            </div>
                            <span className="font-medium">{usuario.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[280px] align-middle text-muted-foreground">
                          <span className="block truncate">{usuario.email}</span>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Badge variant="secondary" className="gap-1.5">
                            <Icon className={`size-3 ${roleConfig.iconClassName}`} />
                            {roleConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-middle text-muted-foreground">
                          {formatarDataHora(usuario.criadoEm ?? '')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
