// ==================== ENUMS ====================

export type TipoConta = 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'CARTEIRA'

export type TipoCategoria = 'RECEITA' | 'DESPESA'

export type TipoTransacao = 'RECEITA' | 'DESPESA'

export type Role = 'ADMIN' | 'USUARIO'

// ==================== AUTH ====================

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: number
    email: string
    role: Role
  }
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface RegistroRequest {
  nome: string
  email: string
  senha: string
  role?: Role
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface UserInfo {
  id: number
  nome?: string
  email: string
  role: Role
  criadoEm?: string
  createdAt?: string
}

// ==================== CONTA ====================

export interface CriarContaRequest {
  nome: string
  tipo: TipoConta
  saldoInicial: number
  ativo?: boolean
}

export interface AtualizarContaRequest {
  nome: string
  tipo: TipoConta
  saldoInicial: number
  ativo: boolean
}

export interface ResumoConta {
  id: number
  nome: string
  tipo: TipoConta
  saldoAtual: number
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

// ==================== CATEGORIA ====================

export interface CriarCategoriaRequest {
  nome: string
  tipo: TipoCategoria
  descricao?: string
}

export interface AtualizarCategoriaRequest {
  nome?: string
  tipo?: TipoCategoria
  descricao?: string
}

export interface ResumoCategoria {
  id: number
  nome: string
  tipo: TipoCategoria
  descricao?: string
  criadoEm: string
  atualizadoEm: string
}

// ==================== TRANSACAO ====================

export interface CriarTransacaoRequest {
  descricao: string
  valor: number
  tipo: TipoTransacao
  data: string // YYYY-MM-DD
  contaId: number
  categoriaId: number
  observacoes?: string
}

export interface AtualizarTransacaoRequest {
  descricao?: string
  valor?: number
  tipo?: TipoTransacao
  data?: string
  contaId?: number
  categoriaId?: number
  observacoes?: string
}

export interface ResumoTransacao {
  id: number
  descricao: string
  valor: number
  tipo: TipoTransacao
  data: string
  contaId: number
  contaNome: string
  categoriaId: number
  categoriaNome: string
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface FiltroTransacao {
  tipo?: TipoTransacao
  contaId?: number
  categoriaId?: number
  dataInicio?: string
  dataFim?: string
  page?: number
  size?: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// ==================== DASHBOARD ====================

export interface ResumoDashboard {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  transacoesRecentes: ResumoTransacao[]
  dadosMensais: DadoMensal[]
}

export interface DadoMensal {
  mes: string
  receitas: number
  despesas: number
}

// ==================== ERRO ====================

export interface RespostaErro {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errors?: Record<string, string>
}
