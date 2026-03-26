// ==================== ENUMS ====================

export type TipoConta = 'CORRENTE' | 'POUPANCA' | 'INVESTIMENTO' | 'CARTEIRA'

export type TipoCategoria = 'RECEITA' | 'DESPESA'

export type TipoTransacao = 'RECEITA' | 'DESPESA'

export type Role = 'ADMIN' | 'USUARIO'

export type BandeiraCartao = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'HIPERCARD' | 'OUTRO'

export type TipoCartao = 'CREDITO' | 'DEBITO'

export type StatusFatura = 'ABERTA' | 'FECHADA' | 'PAGA'

export type StatusMeta = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA' | 'EXPIRADA'

export type FrequenciaRecorrencia =
  | 'DIARIA'
  | 'SEMANAL'
  | 'QUINZENAL'
  | 'MENSAL'
  | 'BIMESTRAL'
  | 'TRIMESTRAL'
  | 'SEMESTRAL'
  | 'ANUAL'

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
  ativo: boolean
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
  cardId?: number
  observacoes?: string
}

export interface AtualizarTransacaoRequest {
  descricao?: string
  valor?: number
  tipo?: TipoTransacao
  data?: string
  contaId?: number
  categoriaId?: number
  cardId?: number
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
  cardId?: number
  cardNome?: string
  recurrenceId?: number
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

// ==================== CARTAO ====================

export interface CriarCartaoRequest {
  nome: string
  bandeira: BandeiraCartao
  tipo: TipoCartao
  accountId?: number
  limite?: number
  diaFechamento?: number
  diaVencimento?: number
}

export interface ResumoCartao {
  id: number
  nome: string
  bandeira: BandeiraCartao
  tipo: TipoCartao
  accountId?: number
  accountNome?: string
  limite?: number
  limiteDisponivel?: number
  diaFechamento?: number
  diaVencimento?: number
  ativo: boolean
  criadoEm: string
}

export interface ResumoFaturaCartao {
  id: number
  cardId: number
  cardNome: string
  mesReferencia: number
  anoReferencia: number
  valorTotal: number
  dataVencimento: string
  status: StatusFatura
  criadoEm: string
}

export interface AtualizarFaturaCartaoRequest {
  mesReferencia?: number
  anoReferencia?: number
  valorTotal?: number
  dataVencimento?: string
  status?: StatusFatura
}

// ==================== META ====================

export interface CriarMetaRequest {
  nome: string
  descricao?: string
  valorAlvo: number
  dataInicio: string
  dataPrazo: string
  accountId?: number
}

export interface DepositarMetaRequest {
  valor: number
}

export interface ResumoMeta {
  id: number
  nome: string
  descricao?: string
  valorAlvo: number
  valorAtual: number
  dataInicio: string
  dataPrazo: string
  status: StatusMeta
  accountId?: number
  accountNome?: string
  criadoEm: string
}

export interface ProgressoMeta {
  valorAlvo: number
  valorAtual: number
  percentualConcluido: number
  valorRestante: number
  diasRestantes: number
  status: StatusMeta
}

// ==================== RECORRENCIA ====================

export interface CriarRecorrenciaRequest {
  nome: string
  descricao?: string
  tipo: TipoTransacao
  valor: number
  frequencia: FrequenciaRecorrencia
  diaCobranca?: number
  dataInicio: string
  dataFim?: string
  accountId: number
  categoryId?: number
  cardId?: number
}

export interface ResumoRecorrencia {
  id: number
  nome: string
  descricao?: string
  tipo: TipoTransacao
  valor: number
  frequencia: FrequenciaRecorrencia
  diaCobranca?: number
  dataInicio: string
  dataFim?: string
  proximaExecucao: string
  ativo: boolean
  accountId: number
  accountNome: string
  categoryId?: number
  categoryNome?: string
  cardId?: number
  cardNome?: string
  ultimaFalha?: string
  motivoFalha?: string
  criadoEm: string
}

export interface HistoricoRecorrencia {
  transacoes: ResumoTransacao[]
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

export interface FaturaResumidaDashboard {
  id: number
  cartao: string
  mes: number
  ano: number
  valor: number
  status: StatusFatura
}

export interface MetaResumidaDashboard {
  id: number
  nome: string
  percentualConcluido: number
}

export interface RecorrenciaResumidaDashboard {
  id: number
  nome: string
  proximaExecucao: string
  frequencia: FrequenciaRecorrencia
}

export interface DashboardResumoResponse {
  saldoTotal: number
  totalReceitas: number
  totalDespesas: number
  saldoMes: number
  limiteCartaoTotal: number
  limiteCartaoUsado: number
  faturas: FaturaResumidaDashboard[]
  metas: MetaResumidaDashboard[]
  recorrencias: RecorrenciaResumidaDashboard[]
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
