"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Loader2 } from "lucide-react"
import { login } from "@/lib/auth-service"
import { ApiError } from "@/lib/api-client"
import { getAuthSession, isSessionValid } from "@/lib/auth-session"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isSessionValid(getAuthSession())) {
      router.replace("/")
    }
  }, [router])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login({ email, senha })
      router.replace("/")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.payload?.message ?? "Nao foi possivel autenticar.")
      } else {
        setError("Erro inesperado ao fazer login.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Pierre Finance</p>
            <p className="text-[#A1A1AA] text-sm">Entre para continuar</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-[#A1A1AA]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-4 py-3 bg-black border border-[#1a1a1a] rounded-xl text-white outline-none focus:border-[#CCFF00]/50 transition-colors"
              placeholder="voce@email.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-[#A1A1AA]">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              className="w-full px-4 py-3 bg-black border border-[#1a1a1a] rounded-xl text-white outline-none focus:border-[#CCFF00]/50 transition-colors"
              placeholder="********"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-3 bg-[#CCFF00] text-black rounded-xl font-semibold hover:bg-[#b8e600] disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  )
}
