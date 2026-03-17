import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { RespostaErro } from '@/types'
import { AxiosError } from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico para moeda brasileira (R$)
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

/**
 * Formata uma data ISO para formato brasileiro (dd/MM/yyyy)
 */
export function formatarData(data: string): string {
  try {
    return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return data
  }
}

/**
 * Formata uma data ISO para formato completo brasileiro
 */
export function formatarDataHora(data: string): string {
  try {
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return data
  }
}

/**
 * Trata erros da API e retorna uma mensagem amigável
 */
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
        return data?.message || 'Dados inválidos. Verifique os campos e tente novamente.'
      case 401:
        return 'Sessão expirada. Faça login novamente.'
      case 403:
        return 'Você não tem permissão para realizar esta ação.'
      case 404:
        return 'Recurso não encontrado.'
      case 409:
        return data?.message || 'Este registro já existe.'
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

/**
 * Capitaliza a primeira letra de uma string
 */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}
