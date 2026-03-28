export type TransactionType = "RECEITA" | "DESPESA"
export type CategoryType = "RECEITA" | "DESPESA"
export type AccountType =
  | "CORRENTE"
  | "POUPANCA"
  | "INVESTIMENTO"
  | "CARTEIRA"
  | "OUTRO"
export type CardType = "CREDITO" | "DEBITO"
export type CardBrand =
  | "VISA"
  | "MASTERCARD"
  | "ELO"
  | "AMEX"
  | "HIPERCARD"
  | "OUTRO"

export interface UserLogin {
  id: number
  email: string
  role: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserLogin
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface DashboardResponse {
  saldoTotal: number
  totalReceitas: number
  totalDespesas: number
  saldoMes: number
  limiteCartaoTotal: number
  limiteCartaoUsado: number
}

export interface TransactionSummary {
  id: number
  tipo: TransactionType
  valor: number
  descricao: string
  dataTransacao: string
  observacao: string | null
  criadoEm: string
  accountId: number | null
  accountNome: string | null
  categoryId: number | null
  categoryNome: string | null
  cardId: number | null
  cardNome: string | null
  recurrenceId: number | null
}

export interface CreateTransactionRequest {
  accountId: number
  categoryId: number | null
  cardId: number | null
  tipo: TransactionType
  valor: number
  descricao: string
  dataTransacao: string
  observacao: string | null
}

export interface AccountSummary {
  id: number
  nome: string
  tipo: AccountType
  saldoInicial: number
  saldoAtual: number
  ativo: boolean
  criadoEm: string
}

export interface CategorySummary {
  id: number
  nome: string
  tipo: CategoryType
  criadoEm: string
}

export interface CardSummary {
  id: number
  nome: string
  bandeira: CardBrand
  tipo: CardType
  accountId: number
  accountNome: string
  limite: number
  limiteDisponivel: number
  diaFechamento: number
  diaVencimento: number
  ativo: boolean
  criadoEm: string
}

export interface ApiErrorPayload {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
}
