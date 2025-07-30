"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2, Download, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DataManagementProps {
  onClearData: () => void
  onExportData: () => void
}

export function DataManagement({ onClearData, onExportData }: DataManagementProps) {
  const { toast } = useToast()

  const handleClearData = () => {
    onClearData()
    toast({
      title: "Dados limpos!",
      description: "Todos os dados foram removidos com sucesso.",
    })
  }

  const handleExportData = () => {
    onExportData()
    toast({
      title: "Dados exportados!",
      description: "Seus dados foram exportados com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Gerenciamento de Dados
        </CardTitle>
        <CardDescription>
          Gerencie seus dados do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={handleExportData}
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados (JSON)
          </Button>
          <p className="text-sm text-muted-foreground">
            Baixe todos os seus dados em formato JSON
          </p>
        </div>

        <div className="border-t pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos, incluindo:
                  <br />• Vendas importadas
                  <br />• Despesas registradas
                  <br />• Custos fixos
                  <br />• Configurações de perfil
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sim, limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-sm text-muted-foreground mt-2">
            Esta ação é irreversível. Use com cuidado.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}