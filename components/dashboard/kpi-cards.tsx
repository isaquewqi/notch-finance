"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIData, formatCurrency, formatPercentage } from "@/lib/calculations"
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Percent } from "lucide-react"

interface KPICardsProps {
  data: KPIData
}

export function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      title: "Receita Bruta",
      value: formatCurrency(data.grossRevenue),
      icon: DollarSign,
      trend: data.grossRevenue > 0 ? "up" : "neutral",
      color: "text-green-500"
    },
    {
      title: "Lucro Líquido",
      value: formatCurrency(data.netProfit),
      icon: data.netProfit > 0 ? TrendingUp : TrendingDown,
      trend: data.netProfit > 0 ? "up" : "down",
      color: data.netProfit > 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(data.averageTicket),
      icon: Target,
      trend: "neutral",
      color: "text-blue-500"
    },
    {
      title: "ROI",
      value: formatPercentage(data.roi),
      icon: Percent,
      trend: data.roi > 0 ? "up" : "down",
      color: data.roi > 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Total de Vendas",
      value: data.totalSales.toString(),
      icon: BarChart3,
      trend: "neutral",
      color: "text-purple-500"
    },
    {
      title: "Margem %",
      value: formatPercentage(data.marginPercentage),
      icon: Target,
      trend: data.marginPercentage > 20 ? "up" : data.marginPercentage > 10 ? "neutral" : "down",
      color: data.marginPercentage > 20 ? "text-green-500" : data.marginPercentage > 10 ? "text-yellow-500" : "text-red-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.trend !== "neutral" && (
              <div className={`flex items-center text-xs ${kpi.color} mt-1`}>
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                <span>{kpi.trend === "up" ? "Positivo" : "Atenção"}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}