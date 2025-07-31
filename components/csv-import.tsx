"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, Download, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sale, generateId } from "@/lib/storage"
import * as XLSX from 'xlsx'

interface CSVImportProps {
  onImport: (sales: Sale[]) => void
}

export function CSVImport({ onImport }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    grossValue: '',
    netValue: ''
  })
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile)
      previewFile(selectedFile)
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV ou Excel válido.",
        variant: "destructive"
      })
    }
  }

  const previewFile = async (file: File) => {
    try {
      let data: any[] = []
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      } else {
        const text = await file.text()
        const lines = text.split('\n')
        data = lines.map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')))
      }

      if (data.length > 0) {
        const headers = data[0] as string[]
        setAvailableColumns(headers)
        setPreviewData(data.slice(1, 6)) // Show first 5 rows for preview
        
        // Auto-detect columns based on common patterns (including new format)
        const autoMapping = {
          date: '',
          grossValue: '',
          netValue: ''
        }

        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('data') || lowerHeader.includes('date') || 
              (lowerHeader.includes('ano') || lowerHeader.includes('mês') || lowerHeader.includes('dia'))) {
            autoMapping.date = header
          } else if (lowerHeader.includes('bruto') || lowerHeader.includes('gross') || 
                     lowerHeader.includes('valor vendas') || lowerHeader.includes('total')) {
            autoMapping.grossValue = header
          } else if (lowerHeader.includes('líquido') || lowerHeader.includes('liquido') || 
                     lowerHeader.includes('net') || lowerHeader.includes('recebido') || 
                     lowerHeader.includes('valor')) {
            autoMapping.netValue = header
          }
        })

        setColumnMapping(autoMapping)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao visualizar o arquivo.",
        variant: "destructive"
      })
    }
  }

  const parseBrazilianDate = (dateStr: string, row?: any[], headers?: string[]): string => {
    if (!dateStr) return new Date().toISOString()
    
    // Check if we have separate year, month, day columns (new format)
    if (row && headers) {
      const yearIndex = headers.findIndex(h => h.toLowerCase().includes('ano'))
      const monthIndex = headers.findIndex(h => h.toLowerCase().includes('mês'))
      const dayIndex = headers.findIndex(h => h.toLowerCase().includes('dia'))
      
      if (yearIndex !== -1 && monthIndex !== -1 && dayIndex !== -1) {
        const year = row[yearIndex]
        const monthName = row[monthIndex]
        const day = row[dayIndex]
        
        // Convert Portuguese month names to numbers
        const monthMap: { [key: string]: number } = {
          'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
          'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
          'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
        }
        
        const monthNumber = monthMap[monthName.toLowerCase()] || parseInt(monthName)
        
        if (year && monthNumber && day) {
          const date = new Date(parseInt(year), monthNumber - 1, parseInt(day))
          if (!isNaN(date.getTime())) {
            return date.toISOString()
          }
        }
      }
    }
    
    // Remove any extra characters and trim
    const cleanDate = dateStr.toString().trim()
    
    // Try different date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    ]

    for (const format of formats) {
      const match = cleanDate.match(format)
      if (match) {
        let day, month, year
        
        if (format === formats[1]) { // YYYY-MM-DD
          [, year, month, day] = match
        } else { // DD/MM/YYYY or DD-MM-YYYY
          [, day, month, year] = match
        }
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      }
    }

    // Try parsing as Excel serial date
    const excelDate = parseFloat(cleanDate)
    if (!isNaN(excelDate) && excelDate > 25000) { // Reasonable Excel date range
      const date = new Date((excelDate - 25569) * 86400 * 1000)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }

    // Fallback: try direct parsing
    const fallbackDate = new Date(cleanDate)
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString()
    }

    // Last resort: use current date
    return new Date().toISOString()
  }

  const parseValue = (valueStr: string): number => {
    if (!valueStr) return 0
    
    const cleanValue = valueStr.toString()
      .replace(/[R$\s]/g, '') // Remove R$ and spaces
      .replace(/\./g, '') // Remove thousands separator
      .replace(',', '.') // Replace decimal comma with dot
    
    const parsed = parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
  }

  const parseData = (data: any[]): Sale[] => {
    const sales: Sale[] = []
    const dateIndex = availableColumns.indexOf(columnMapping.date)
    const grossIndex = availableColumns.indexOf(columnMapping.grossValue)
    const netIndex = availableColumns.indexOf(columnMapping.netValue)

    if (dateIndex === -1 || grossIndex === -1 || netIndex === -1) {
      throw new Error('Mapeamento de colunas incompleto')
    }

    // Check if we have the new format with separate date columns
    const hasNewFormat = availableColumns.some(col => 
      col.toLowerCase().includes('ano') || 
      col.toLowerCase().includes('mês') || 
      col.toLowerCase().includes('dia')
    )

    data.forEach((row, index) => {
      if (!row || row.length === 0 || row[0] === 'Total') return // Skip total row
      
      try {
        let date: string
        
        if (hasNewFormat) {
          // For new format, pass the entire row and headers to parse date
          date = parseBrazilianDate(row[dateIndex], row, availableColumns)
        } else {
          // For old format, just parse the date string
          date = parseBrazilianDate(row[dateIndex])
        }
        
        const grossValue = parseValue(row[grossIndex])
        const netValue = parseValue(row[netIndex])

        // For new format, we might need to multiply by quantity
        const quantityIndex = availableColumns.findIndex(col => 
          col.toLowerCase().includes('vendas') && !col.toLowerCase().includes('valor')
        )
        
        let finalGrossValue = grossValue
        let finalNetValue = netValue
        
        if (hasNewFormat && quantityIndex !== -1) {
          const quantity = parseInt(row[quantityIndex]) || 1
          // The values in the new format are already totals, so we don't multiply
          finalGrossValue = grossValue
          finalNetValue = netValue
          
          // Create individual sales for each quantity
          for (let i = 0; i < quantity; i++) {
            sales.push({
              id: generateId(),
              date,
              grossValue: grossValue / quantity,
              netValue: netValue / quantity,
              source: 'pushinpay'
            })
          }
        } else if (finalGrossValue > 0 || finalNetValue > 0) {
          sales.push({
            id: generateId(),
            date,
            grossValue: finalGrossValue,
            netValue: finalNetValue,
            source: 'pushinpay'
          })
        }
      } catch (error) {
        console.warn(`Erro ao processar linha ${index + 1}:`, error)
      }
    })

    return sales
  }

  const handleImport = async () => {
    if (!file || !columnMapping.date || !columnMapping.grossValue || !columnMapping.netValue) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo e configure o mapeamento de colunas.",
        variant: "destructive"
      })
      return
    }

    setImporting(true)
    
    try {
      let data: any[] = []
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        data = data.slice(1) // Remove header
      } else {
        const text = await file.text()
        const lines = text.split('\n')
        data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')))
      }

      const sales = parseData(data)
      
      if (sales.length > 0) {
        onImport(sales)
        toast({
          title: "Sucesso!",
          description: `${sales.length} vendas importadas com sucesso.`,
        })
        setFile(null)
        setPreviewData([])
        setAvailableColumns([])
        setColumnMapping({ date: '', grossValue: '', netValue: '' })
      } else {
        toast({
          title: "Aviso",
          description: "Nenhuma venda válida encontrada no arquivo.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo: " + (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadExampleFile = () => {
    const exampleData = [
      ['Ano', 'Mês', 'Dia', 'Vendas', 'Valor Vendas', 'Total Recebido'],
      ['2024', 'Janeiro', '1', '2', '29,80', '28,31'],
      ['2024', 'Janeiro', '2', '1', '14,90', '14,16'],
      ['2024', 'Janeiro', '3', '3', '44,70', '42,47'],
      ['2024', 'Janeiro', '4', '1', '14,90', '14,16'],
      ['2024', 'Janeiro', '5', '2', '29,80', '28,31']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(exampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas Diárias')
    
    XLSX.writeFile(workbook, 'exemplo-vendas-diarias.xlsx')
    
    toast({
      title: "Sucesso!",
      description: "Planilha de exemplo baixada com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Vendas
        </CardTitle>
        <CardDescription>
          Importe suas vendas através de arquivos CSV ou Excel (.xlsx). Suporta formatos de vendas diárias e relatórios do PushinPay.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadExampleFile}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Exemplo
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-input">Arquivo CSV ou Excel</Label>
          <Input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground">
            Formatos aceitos: .csv, .xlsx, .xls
          </p>
        </div>
        
        {file && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{file.name}</span>
            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
          </div>
        )}

        {availableColumns.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Mapeamento de Colunas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Coluna de Data (ou Ano para formato diário)</Label>
                <Select value={columnMapping.date} onValueChange={(value) => setColumnMapping({...columnMapping, date: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coluna de Valor Bruto (Valor Vendas)</Label>
                <Select value={columnMapping.grossValue} onValueChange={(value) => setColumnMapping({...columnMapping, grossValue: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coluna de Valor Líquido (Total Recebido)</Label>
                <Select value={columnMapping.netValue} onValueChange={(value) => setColumnMapping({...columnMapping, netValue: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {availableColumns.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Formatos Suportados:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Formato Diário:</strong> Ano, Mês, Dia, Vendas, Valor Vendas, Total Recebido</li>
              <li>• <strong>Formato PushinPay:</strong> Data, Valor Bruto, Valor Líquido</li>
            </ul>
          </div>
        )}

        {previewData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Prévia dos Dados</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {availableColumns.map((col) => (
                      <th key={col} className="p-2 text-left font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-b">
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="p-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleImport}
          disabled={!file || importing || !columnMapping.date || !columnMapping.grossValue || !columnMapping.netValue}
          className="w-full"
        >
          {importing ? "Importando..." : "Importar Vendas"}
        </Button>
      </CardContent>
    </Card>
  )
}