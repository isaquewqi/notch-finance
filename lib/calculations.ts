import { Sale, FixedCost, VariableExpense } from './storage'

export interface KPIData {
  grossRevenue: number
  netRevenue: number
  totalExpenses: number
  netProfit: number
  averageTicket: number
  totalSales: number
  roi: number
  marginPercentage: number
}

export function calculateKPIs(
  sales: Sale[],
  fixedCosts: FixedCost[],
  variableExpenses: VariableExpense[],
  period?: { start: Date; end: Date }
): KPIData {
  // Filter data by period if provided
  let filteredSales = sales
  let filteredExpenses = variableExpenses
  let filteredFixedCosts = fixedCosts

  if (period) {
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate >= period.start && saleDate <= period.end
    })

    filteredExpenses = variableExpenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= period.start && expenseDate <= period.end
    })

    // For fixed costs, calculate proportional amount based on period
    const monthsInPeriod = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    filteredFixedCosts = fixedCosts.map(cost => ({
      ...cost,
      value: cost.type === 'monthly' ? cost.value * monthsInPeriod : cost.value * (monthsInPeriod / 12)
    }))
  }

  const grossRevenue = filteredSales.reduce((sum, sale) => sum + sale.grossValue, 0)
  const netRevenue = filteredSales.reduce((sum, sale) => sum + sale.netValue, 0)
  const totalVariableExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0)
  const totalFixedCosts = filteredFixedCosts.reduce((sum, cost) => sum + cost.value, 0)
  const totalExpenses = totalVariableExpenses + totalFixedCosts
  const netProfit = netRevenue - totalExpenses
  const totalSales = filteredSales.length
  const averageTicket = totalSales > 0 ? grossRevenue / totalSales : 0
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0
  const marginPercentage = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

  return {
    grossRevenue,
    netRevenue,
    totalExpenses,
    netProfit,
    averageTicket,
    totalSales,
    roi,
    marginPercentage
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getDailySalesData(sales: Sale[], days: number = 30) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const dailyData: { [key: string]: number } = {}
  
  // Initialize all days with 0
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyData[dateStr] = 0
  }

  // Add sales data
  sales.forEach(sale => {
    const saleDate = new Date(sale.date)
    if (saleDate >= startDate && saleDate <= endDate) {
      const dateStr = sale.date.split('T')[0]
      dailyData[dateStr] += sale.netValue
    }
  })

  return Object.entries(dailyData).map(([date, value]) => ({
    date,
    value,
    formattedDate: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }))
}

export function getExpenseDistribution(expenses: VariableExpense[]) {
  const distribution: { [key: string]: number } = {}
  
  expenses.forEach(expense => {
    distribution[expense.category] = (distribution[expense.category] || 0) + expense.value
  })

  return Object.entries(distribution).map(([category, value]) => ({
    category: getCategoryLabel(category),
    value,
    percentage: expenses.length > 0 ? (value / expenses.reduce((sum, exp) => sum + exp.value, 0)) * 100 : 0
  }))
}

function getCategoryLabel(category: string): string {
  const labels: { [key: string]: string } = {
    traffic: 'Tráfego',
    domain: 'Domínio',
    tools: 'Ferramentas',
    content: 'Conteúdo',
    other: 'Outros'
  }
  return labels[category] || category
}