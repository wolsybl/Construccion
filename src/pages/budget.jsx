
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ExpenseDialog } from "@/components/budget/expense-dialog"
import { useBudget } from "@/hooks/use-budget"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

export function BudgetPage() {
  const { budget, addExpense, updateExpense, deleteExpense, setTotalBudget } = useBudget()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)

  const handleSubmit = (expenseData) => {
    try {
      if (selectedExpense?.id) {
        updateExpense(selectedExpense.id, expenseData)
        toast({
          title: "Gasto actualizado",
          description: "El gasto se ha actualizado correctamente",
        })
      } else {
        addExpense(expenseData)
        toast({
          title: "Gasto registrado",
          description: "El gasto se ha registrado correctamente",
        })
      }
      setDialogOpen(false)
      setSelectedExpense(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el gasto",
      })
    }
  }

  const handleEdit = (expense) => {
    setSelectedExpense(expense)
    setDialogOpen(true)
  }

  const handleDelete = (id) => {
    try {
      deleteExpense(id)
      toast({
        title: "Gasto eliminado",
        description: "El gasto se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el gasto",
      })
    }
  }

  const handleAddNew = () => {
    setSelectedExpense(null)
    setDialogOpen(true)
  }

  const totalExpenses = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remaining = budget.total - totalExpenses

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Presupuesto</h1>
        <Button onClick={handleAddNew}>
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(budget.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(remaining)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budget.expenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader>
              <CardTitle className="text-xl">{expense.concept}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Monto: {formatCurrency(expense.amount)}</p>
                <p className="text-sm">Fecha: {formatDate(expense.date)}</p>
                <p className="text-sm">Categoría: {expense.category}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(expense)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        expense={selectedExpense}
      />
    </div>
  )
}
