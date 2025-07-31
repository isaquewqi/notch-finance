/**
 * Conversor de planilhas de vendas agregadas para formato transacional PushinPay
 * 
 * Transforma dados agregados por dia em registros individuais de vendas
 * seguindo as regras específicas do PushinPay
 */

interface DailySalesRow {
  year: string
  month: string
  day: string
  quantity: number
  grossValue: number
  netValue: number
}

const MONTH_MAP: { [key: string]: number } = {
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
  'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
  'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
}

/**
 * Converte valor brasileiro (19,90) para formato decimal (19.90)
 */
function parseValue(valueStr: string): number {
  if (!valueStr) return 0
  
  const cleanValue = valueStr.toString()
    .replace(/[R$\s]/g, '') // Remove R$ e espaços
    .replace(/\./g, '') // Remove separador de milhares
    .replace(',', '.') // Substitui vírgula decimal por ponto
  
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Formata data no padrão dd/mm/yyyy
 */
function formatDate(day: string, month: string, year: string): string {
  const monthNumber = MONTH_MAP[month.toLowerCase()] || parseInt(month)
  const dayNumber = parseInt(day)
  const yearNumber = parseInt(year)
  
  if (!monthNumber || !dayNumber || !yearNumber) {
    throw new Error(`Data inválida: ${day}/${month}/${year}`)
  }
  
  return `${dayNumber.toString().padStart(2, '0')}/${monthNumber.toString().padStart(2, '0')}/${yearNumber}`
}

/**
 * Formata valor para formato brasileiro com 2 casas decimais
 */
function formatCurrency(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

/**
 * Processa uma linha de dados agregados e gera N registros individuais
 */
function processAggregatedRow(row: DailySalesRow): string[][] {
  const records: string[][] = []
  const date = formatDate(row.day, row.month, row.year)
  const unitNetValue = row.netValue / row.quantity // Divide valor líquido igualmente
  
  // Gera N registros individuais onde N = quantidade de vendas
  for (let i = 0; i < row.quantity; i++) {
    const record = [
      date, // Data
      '1', // Quantidade (sempre 1 por linha)
      'Produto Genérico', // Nome do Produto (padrão)
      formatCurrency(row.grossValue), // Valor Unitário (bruto)
      formatCurrency(unitNetValue), // Total Recebido (líquido dividido)
      '', // Meio de Pagamento (em branco)
      '', // Status (em branco)
      '', // Observações (em branco)
      `Venda ${i + 1} de ${row.quantity} do dia ${date}` // Identificação
    ]
    records.push(record)
  }
  
  return records
}

/**
 * Converte planilha de vendas agregadas para formato transacional PushinPay
 */
export function convertToPushinPayFormat(data: any[][]): string[][] {
  if (!data || data.length === 0) {
    throw new Error('Dados vazios ou inválidos')
  }
  
  // Cabeçalho do formato PushinPay
  const header = [
    'Data',
    'Quantidade',
    'Nome do Produto',
    'Valor Unitário',
    'Total Recebido',
    'Meio de Pagamento',
    'Status',
    'Observações',
    'Identificação'
  ]
  
  const result: string[][] = [header]
  const headers = data[0] as string[]
  
  // Identifica índices das colunas necessárias
  const yearIndex = headers.findIndex(h => h.toLowerCase().includes('ano'))
  const monthIndex = headers.findIndex(h => h.toLowerCase().includes('mês'))
  const dayIndex = headers.findIndex(h => h.toLowerCase().includes('dia'))
  const quantityIndex = headers.findIndex(h => 
    h.toLowerCase().includes('vendas') && !h.toLowerCase().includes('valor')
  )
  const grossValueIndex = headers.findIndex(h => 
    h.toLowerCase().includes('valor') && h.toLowerCase().includes('vendas')
  )
  const netValueIndex = headers.findIndex(h => 
    h.toLowerCase().includes('total') && h.toLowerCase().includes('recebido')
  )
  
  // Valida se todas as colunas necessárias foram encontradas
  if (yearIndex === -1 || monthIndex === -1 || dayIndex === -1 || 
      quantityIndex === -1 || grossValueIndex === -1 || netValueIndex === -1) {
    throw new Error('Formato de planilha inválido. Colunas necessárias: Ano, Mês, Dia, Vendas, Valor Vendas, Total Recebido')
  }
  
  // Processa cada linha de dados (pula cabeçalho e linha de total)
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    
    // Pula linhas vazias ou linha de total
    if (!row || row.length === 0 || row[0] === 'Total' || row[0] === '') {
      continue
    }
    
    try {
      const dailySales: DailySalesRow = {
        year: row[yearIndex]?.toString() || '',
        month: row[monthIndex]?.toString() || '',
        day: row[dayIndex]?.toString() || '',
        quantity: parseInt(row[quantityIndex]?.toString() || '0'),
        grossValue: parseValue(row[grossValueIndex]?.toString() || '0'),
        netValue: parseValue(row[netValueIndex]?.toString() || '0')
      }
      
      // Valida dados básicos
      if (!dailySales.year || !dailySales.month || !dailySales.day || 
          dailySales.quantity <= 0 || dailySales.grossValue <= 0) {
        console.warn(`Linha ${i + 1} ignorada: dados inválidos`, dailySales)
        continue
      }
      
      // Processa linha agregada e gera registros individuais
      const individualRecords = processAggregatedRow(dailySales)
      result.push(...individualRecords)
      
    } catch (error) {
      console.warn(`Erro ao processar linha ${i + 1}:`, error)
      continue
    }
  }
  
  if (result.length === 1) {
    throw new Error('Nenhum registro válido foi processado')
  }
  
  return result
}

/**
 * Gera planilha de exemplo no formato de vendas diárias
 */
export function generateDailySalesExample(): string[][] {
  return [
    ['Ano', 'Mês', 'Dia', 'Vendas', 'Valor Vendas', 'Total Recebido'],
    ['2025', 'Janeiro', '1', '2', '29,80', '28,31'],
    ['2025', 'Janeiro', '2', '1', '14,90', '14,16'],
    ['2025', 'Janeiro', '3', '3', '44,70', '42,47'],
    ['2025', 'Janeiro', '4', '1', '14,90', '14,16'],
    ['2025', 'Janeiro', '5', '2', '29,80', '28,31']
  ]
}

/**
 * Gera planilha de exemplo no formato PushinPay transacional
 */
export function generatePushinPayExample(): string[][] {
  return [
    ['Data', 'Quantidade', 'Nome do Produto', 'Valor Unitário', 'Total Recebido', 'Meio de Pagamento', 'Status', 'Observações', 'Identificação'],
    ['01/01/2025', '1', 'Produto Genérico', '14,90', '14,16', '', '', '', 'Venda 1 de 2 do dia 01/01/2025'],
    ['01/01/2025', '1', 'Produto Genérico', '14,90', '14,15', '', '', '', 'Venda 2 de 2 do dia 01/01/2025'],
    ['02/01/2025', '1', 'Produto Genérico', '14,90', '14,16', '', '', '', 'Venda 1 de 1 do dia 02/01/2025'],
    ['03/01/2025', '1', 'Produto Genérico', '14,90', '14,16', '', '', '', 'Venda 1 de 3 do dia 03/01/2025'],
    ['03/01/2025', '1', 'Produto Genérico', '14,90', '14,16', '', '', '', 'Venda 2 de 3 do dia 03/01/2025'],
    ['03/01/2025', '1', 'Produto Genérico', '14,90', '14,15', '', '', '', 'Venda 3 de 3 do dia 03/01/2025']
  ]
}