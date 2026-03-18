import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AxiosError } from 'axios'
import type { RespostaErro } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data: string): string {
  try {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return data
  }
}

export function formatarDataHora(data: string): string {
  try {
    return format(parseISO(data), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })
  } catch {
    return data
  }
}

export function tratarErro(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as RespostaErro | undefined

    switch (status) {
      case 400:
        if (data?.errors) {
          const mensagens = Object.values(data.errors)
          return mensagens.join('. ')
        }
        return data?.message || 'Dados invalidos. Verifique os campos e tente novamente.'
      case 401:
        return 'Sessao expirada. Faca login novamente.'
      case 403:
        return 'Voce nao tem permissao para realizar esta acao.'
      case 404:
        return 'Recurso nao encontrado.'
      case 409:
        return data?.message || 'Este registro ja existe.'
      case 429:
        return 'Muitas tentativas. Aguarde 1 minuto e tente novamente.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      default:
        return data?.message || 'Ocorreu um erro inesperado. Tente novamente.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}
