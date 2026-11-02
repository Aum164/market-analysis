import { create } from 'zustand'
import type { Theme, Quote } from '../types'

interface AppState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  selectedSymbol: string
  setSymbol: (s: string) => void
  quotes: Record<string, Quote>
  setQuote: (q: Quote) => void
  selectedInterval: string
  setInterval: (i: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('market-analysis-theme') as Theme) || 'dark',
  setTheme: (t) => {
    localStorage.setItem('market-analysis-theme', t)
    if (t === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    set({ theme: t })
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  selectedSymbol: 'NIFTY50',
  setSymbol: (s) => set({ selectedSymbol: s }),
  quotes: {},
  setQuote: (q) => set((s) => ({ quotes: { ...s.quotes, [q.symbol]: q } })),
  selectedInterval: '5m',
  setInterval: (i) => set({ selectedInterval: i }),
}))
