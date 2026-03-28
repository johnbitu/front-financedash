import { apiRequest } from "@/lib/api-client"
import type {
  AccountSummary,
  CardSummary,
  CategorySummary,
  CreateTransactionRequest,
  DashboardResponse,
  TransactionSummary,
} from "@/lib/api-types"

export function getDashboardSummary() {
  return apiRequest<DashboardResponse>("/dashboard/resumo")
}

export function listTransactions() {
  return apiRequest<TransactionSummary[]>("/transactions")
}

export function createTransaction(payload: CreateTransactionRequest) {
  return apiRequest<TransactionSummary>("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function listAccounts() {
  return apiRequest<AccountSummary[]>("/accounts")
}

export function listCategories() {
  return apiRequest<CategorySummary[]>("/categories")
}

export function listCards() {
  return apiRequest<CardSummary[]>("/cards")
}
