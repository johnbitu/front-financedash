import { IconTrendingDown, IconTrendingUp, IconWallet } from "@tabler/icons-react"

import { formatarMoeda } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type FinancialCardSummary = {
  saldoAtual: number
  receitasMes: number
  despesasMes: number
  economiaMes: number
}

interface SectionCardsProps {
  summary: FinancialCardSummary
}

export function SectionCards({ summary }: SectionCardsProps) {
  const expenseRatio =
    summary.receitasMes > 0 ? (summary.despesasMes / summary.receitasMes) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saldo atual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatarMoeda(summary.saldoAtual)}
          </CardTitle>
          <CardAction>
            <Badge variant={summary.saldoAtual >= 0 ? "outline" : "destructive"}>
              <IconWallet />
              {summary.saldoAtual >= 0 ? "Positivo" : "Negativo"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Posicao consolidada das suas contas
          </div>
          <div className="text-muted-foreground">Atualizado com base nas transacoes ativas</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Receitas do mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatarMoeda(summary.receitasMes)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Entradas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fluxo de entrada do periodo
          </div>
          <div className="text-muted-foreground">Salarios, rendas extras e recebimentos</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Despesas do mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatarMoeda(summary.despesasMes)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Saidas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {expenseRatio.toFixed(1)}% da receita comprometida
          </div>
          <div className="text-muted-foreground">Controle mensal de custos recorrentes</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Economia do mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatarMoeda(summary.economiaMes)}
          </CardTitle>
          <CardAction>
            <Badge variant={summary.economiaMes >= 0 ? "outline" : "destructive"}>
              {summary.economiaMes >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {summary.economiaMes >= 0 ? "Meta em dia" : "Acima do planejado"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Diferenca entre receita e despesa do mes
          </div>
          <div className="text-muted-foreground">Ajuda a acompanhar sua reserva financeira</div>
        </CardFooter>
      </Card>
    </div>
  )
}
