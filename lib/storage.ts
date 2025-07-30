export interface Sale {
  id: string
  date: string
  grossValue: number
  netValue: number
  source: 'pushinpay' | 'manual'
}

export interface FixedCost {
  id: string
  name: string
  value: number
  type: 'monthly' | 'annual'
  category: string
  recurringDate: string
}

export interface VariableExpense {
  id: string
  name: string
  value: number
  category: 'traffic' | 'domain' | 'tools' | 'content' | 'other'
  date: string
  type: 'business' | 'personal'
}

export interface UserProfile {
  name: string
  avatar: string
  email: string
}

export interface FinancialData {
  sales: Sale[]
  fixedCosts: FixedCost[]
  variableExpenses: VariableExpense[]
  userProfile: UserProfile
}

const STORAGE_KEY = 'financial-data'

export const storage = {
  getData(): FinancialData {
    if (typeof window === 'undefined') {
      return {
        sales: [],
        fixedCosts: [],
        variableExpenses: [],
        userProfile: { name: 'Usuário', avatar: '', email: '' }
      }
    }
    
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return {
        sales: [],
        fixedCosts: [],
        variableExpenses: [],
        userProfile: { name: 'Usuário', avatar: '', email: '' }
      }
    }
    return JSON.parse(data)
  },

  saveData(data: FinancialData): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  },

  clearData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)