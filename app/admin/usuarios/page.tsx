'use client'

import { useEffect, useState } from 'react'
import { Shield, User } from 'lucide-react'

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

import { formatarDataHora, tratarErro, cn } from '@/lib/utils'
import usuarioService from '@/services/usuario-service'
import type { UserInfo, Role } from '@/types'


const rolesConfig: Record<Role, { label: string; className: string; icon: typeof Shield }> = {
  ADMIN: {
    label: 'Administrador',
    className: 'bg-purple-100 text-purple-700',
    icon: Shield,
  },
  USUARIO: {
    label: 'Usuário',
    className: 'bg-blue-100 text-blue-700',
    icon: User,
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
      <div>
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">
          Visualize todos os usuários cadastrados no sistema
        </p>
      </div>

      {error && (
        <PageErrorAlert message={error} />
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{usuarios.length}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">{adminsCount}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Shield className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Comuns</p>
                <p className="text-2xl font-bold">{usuariosCount}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <User className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <Empty>
              <Empty.Icon>
                <User className="size-8" />
              </Empty.Icon>
              <Empty.Title>Nenhum usuário encontrado</Empty.Title>
              <Empty.Description>
                Não há usuários cadastrados no sistema.
              </Empty.Description>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => {
                  const roleConfig = rolesConfig[usuario.role]
                  const Icon = roleConfig.icon

                  return (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        #{usuario.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                            <User className="size-4" />
                          </div>
                          <span className="font-medium">{usuario.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {usuario.email}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                            roleConfig.className
                          )}
                        >
                          <Icon className="size-3" />
                          {roleConfig.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatarDataHora(usuario.criadoEm ?? '')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

