import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" // Asegúrate de que Supabase esté configurado correctamente

export function useBudget() {
  const [budget, setBudget] = useState({ total: 0, expenses: [] })

  // Cargar presupuesto y gastos desde la base de datos al montar el hook
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        // Obtener el presupuesto total
        const { data: budgetData, error: budgetError } = await supabase
          .from("budget")
          .select("*")
          .single()

        if (budgetError) {
          console.error("Error fetching budget:", budgetError)
        }

        // Obtener los gastos
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*")

        if (expensesError) {
          console.error("Error fetching expenses:", expensesError)
        }

        setBudget({
          total: budgetData?.total || 0,
          expenses: expensesData || [],
        })
      } catch (error) {
        console.error("Error fetching budget and expenses:", error)
      }
    }

    fetchBudget()
  }, [])

  const addExpense = async (expense) => {
    const newExpense = {
      ...expense,
      createdAt: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert(newExpense)

    if (error) {
      console.error("Error adding expense:", error)
    } else {
      setBudget({
        ...budget,
        expenses: [...budget.expenses, data[0]],
      })
    }
  }

  const updateExpense = async (id, updates) => {
    const { data, error } = await supabase
      .from("expenses")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating expense:", error)
    } else {
      setBudget({
        ...budget,
        expenses: budget.expenses.map((expense) =>
          expense.id === id ? data[0] : expense
        ),
      })
    }
  }

  const deleteExpense = async (id) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting expense:", error)
    } else {
      setBudget({
        ...budget,
        expenses: budget.expenses.filter((expense) => expense.id !== id),
      })
    }
  }

  const setTotalBudget = async (total) => {
    const { data, error } = await supabase
      .from("budget")
      .upsert({ id: 1, total, updatedAt: new Date().toISOString() }) // Usar `upsert` para insertar o actualizar

    if (error) {
      console.error("Error setting total budget:", error)
    } else {
      setBudget({ ...budget, total: data[0]?.total || total })
    }
  }

  return {
    budget,
    addExpense,
    updateExpense,
    deleteExpense,
    setTotalBudget,
  }
}
