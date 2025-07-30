"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { ExpenseDistribution } from "@/components/dashboard/expense-distribution"
import { CSVImport } from "@/components/csv-import"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { FinancialCalendar } from "@/components/calendar/financial-calendar"
import { UserProfile } from "@/components/user-profile"
import { DataManagement } from "@/components/settings/data-management"
import { Toaster } from "@/components/ui/sonner"
import { storage, FinancialData, Sale, VariableExpense } from "@/lib/storage"
import { calculateKPIs } from "@/lib/calculations"
import { BarChart3, Upload, Receipt, Calendar, User, Settings } from "lucide-react"

export default function Home() {
  const [data, setData] = useState<FinancialData>({
    sales: [],
    fixedCosts: [],
    variableExpenses: [],
    userProfile: { name: 'Usuário', avatar: '', email: '' }
  })

  useEffect(() => {
    const loadedData = storage.getData()
    setData(loadedData)
  }, [])

  const saveData = (newData: FinancialData) => {
    setData(newData)
    storage.saveData(newData)
  }

  const handleImportSales = (newSales: Sale[]) => {
    const updatedData = {
      ...data,
      sales: [...data.sales, ...newSales]
    }
    saveData(updatedData)
  }

  const handleAddExpense = (expense: VariableExpense) => {
    const updatedData = {
      ...data,
      variableExpenses: [...data.variableExpenses, expense]
    }
    saveData(updatedData)
  }

  const handleDeleteExpense = (expenseId: string) => {
    const updatedData = {
      ...data,
      variableExpenses: data.variableExpenses.filter(exp => exp.id !== expenseId)
    }
    saveData(updatedData)
  }

  const handleUpdateProfile = (profile: any) => {
    const updatedData = {
      ...data,
      userProfile: profile
    }
    saveData(updatedData)
  }

  const handleClearData = () => {
    storage.clearData()
    setData({
      sales: [],
      fixedCosts: [],
      variableExpenses: [],
      userProfile: { name: 'Usuário', avatar: '', email: '' }
    })
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financeflow-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const kpiData = calculateKPIs(data.sales, data.fixedCosts, data.variableExpenses)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              FinanceFlow
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Sistema de gestão financeira para negócios digitais
          </p>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <KPICards data={kpiData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SalesChart sales={data.sales} />
              <ExpenseDistribution expenses={data.variableExpenses} />
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CSVImport onImport={handleImportSales} />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vendas Importadas</h3>
                <div className="text-2xl font-bold text-primary">
                  {data.sales.length} vendas
                </div>
                <p className="text-muted-foreground">
                  Total importado até agora
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseForm onAdd={handleAddExpense} />
              <ExpenseList 
                expenses={data.variableExpenses} 
                onDelete={handleDeleteExpense}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <FinancialCalendar 
              sales={data.sales} 
              expenses={data.variableExpenses}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserProfile
                profile={data.userProfile}
                totalRevenue={kpiData.grossRevenue}
                totalExpenses={kpiData.totalExpenses}
                onUpdate={handleUpdateProfile}
              />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {kpiData.netProfit.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-xl font-bold text-blue-600">
                      {kpiData.roi.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataManagement
                onClearData={handleClearData}
                onExportData={handleExportData}
              />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estatísticas do Sistema</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total de vendas:</span>
                    <span className="font-medium">{data.sales.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de despesas:</span>
                    <span className="font-medium">{data.variableExpenses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dados salvos em:</span>
                    <span className="font-medium">LocalStorage</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}