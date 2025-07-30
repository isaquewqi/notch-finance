"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VariableExpense } from "@/lib/storage"
import { formatCurrency } from "@/lib/calculations"
import { Trash2, Receipt } from "lucide-react"

interface ExpenseListProps {
  expenses: VariableExpense[]
  onDelete: (id: string) => void
}

const categoryLabels = {
  traffic: 'Tráfego',
  domain: 'Domínio',
  tools: 'Ferramentas',
  content: 'Conteúdo',
  other: 'Outros'
}

const typeLabels = {
  business: 'Profissional',
  personal: 'Pessoal'
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Despesas Registradas
          </CardTitle>
          <CardDescription>
            Suas despesas aparecerão aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma despesa registrada ainda
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Despesas Registradas
        </CardTitle>
        <CardDescription>
          Total de {expenses.length} despesas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{expense.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[expense.category]}
                  </Badge>
                  <Badge variant={expense.type === 'business' ? 'default' : 'secondary'} className="text-xs">
                    {typeLabels[expense.type]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatCurrency(expense.value)}</span>
                  <span>{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(expense.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}