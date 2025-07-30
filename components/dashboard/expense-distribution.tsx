"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { VariableExpense } from "@/lib/storage"
import { getExpenseDistribution, formatCurrency } from "@/lib/calculations"

interface ExpenseDistributionProps {
  expenses: VariableExpense[]
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#F97316', // orange
]

export function ExpenseDistribution({ expenses }: ExpenseDistributionProps) {
  const data = getExpenseDistribution(expenses)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos</CardTitle>
          <CardDescription>
            Visualize como seus gastos estão distribuídos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum gasto registrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Gastos</CardTitle>
        <CardDescription>
          Visualize como seus gastos estão distribuídos por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Valor']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}