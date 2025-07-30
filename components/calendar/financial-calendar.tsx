"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { Sale, VariableExpense } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, Receipt } from "lucide-react"

interface FinancialCalendarProps {
  sales: Sale[]
  expenses: VariableExpense[]
}

export function FinancialCalendar({ sales, expenses }: FinancialCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const getDateEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const daySales = sales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate >= dayStart && saleDate <= dayEnd
    })

    const dayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= dayStart && expenseDate <= dayEnd
    })

    return { sales: daySales, expenses: dayExpenses }
  }

  const selectedEvents = selectedDate ? getDateEvents(selectedDate) : { sales: [], expenses: [] }

  const modifiers = {
    hasSales: (date: Date) => getDateEvents(date).sales.length > 0,
    hasExpenses: (date: Date) => getDateEvents(date).expenses.length > 0,
  }

  const modifiersStyles = {
    hasSales: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
    },
    hasExpenses: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário Financeiro
          </CardTitle>
          <CardDescription>
            Dias com vendas aparecem em azul, dias com despesas em vermelho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Eventos - ${selectedDate.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
          </CardTitle>
          <CardDescription>
            Vendas e despesas do dia selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedEvents.sales.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Vendas ({selectedEvents.sales.length})</h4>
                </div>
                <div className="space-y-2">
                  {selectedEvents.sales.map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <span className="text-sm">Venda PushinPay</span>
                      <Badge variant="outline" className="text-green-600">
                        R$ {sale.netValue.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEvents.expenses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium">Despesas ({selectedEvents.expenses.length})</h4>
                </div>
                <div className="space-y-2">
                  {selectedEvents.expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <span className="text-sm">{expense.name}</span>
                      <Badge variant="outline" className="text-red-600">
                        R$ {expense.value.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEvents.sales.length === 0 && selectedEvents.expenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento registrado nesta data
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}