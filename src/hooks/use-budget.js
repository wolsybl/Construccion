
import { useLocalStorage } from "./use-local-storage"

export function useBudget() {
  const [budget, setBudget] = useLocalStorage("budget", {
    total: 0,
    expenses: []
  })

  const addExpense = (expense) => {
    setBudget({
      ...budget,
      expenses: [...budget.expenses, { ...expense, id: Date.now() }]
    })
  }

  const updateExpense = (id, updates) => {
    setBudget({
      ...budget,
      expenses: budget.expenses.map(expense => 
        expense.id === id ? { ...expense, ...updates } : expense
      )
    })
  }

  const deleteExpense = (id) => {
    setBudget({
      ...budget,
      expenses: budget.expenses.filter(expense => expense.id !== id)
    })
  }

  const setTotalBudget = (total) => {
    setBudget({ ...budget, total })
  }

  return { 
    budget, 
    addExpense, 
    updateExpense, 
    deleteExpense,
    setTotalBudget
  }
}
