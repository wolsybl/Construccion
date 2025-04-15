import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpenseDialog } from "@/components/budget/expense-dialog";
import { useBudget } from "@/hooks/use-budget";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function BudgetPage() {
  const { 
    budget, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    setTotalBudget,
    isLoading,
    error,
    isMutating,
    refreshBudget
  } = useBudget();

  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Cálculo de totales con validación adicional
  const totalExpenses = budget?.expenses?.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0), 
    0
  ) || 0;
  
  const remaining = (Number(budget?.total) || 0) - totalExpenses;

  const handleSubmit = async (expenseData) => {
    try {
      // Validar que el monto no exceda el presupuesto restante
      if (!selectedExpense && Number(expenseData.amount) > remaining) {
        throw new Error("El monto excede el presupuesto restante");
      }

      // Asegurarse de que los datos coincidan con la estructura de la tabla
      const sanitizedExpenseData = {
        concept: expenseData.concept.trim(),
        amount: Number(expenseData.amount),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        budget_id: budget.id
      };

      if (selectedExpense?.id) {
        await updateExpense(selectedExpense.id, sanitizedExpenseData);
        toast({
          title: "Gasto actualizado",
          description: "El gasto se ha actualizado correctamente",
        });
      } else {
        await addExpense(sanitizedExpenseData);
        toast({
          title: "Gasto registrado",
          description: "El gasto se ha registrado correctamente",
        });
      }
      
      setDialogOpen(false);
      setSelectedExpense(null);
      await refreshBudget();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el gasto",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      toast({
        title: "Gasto eliminado",
        description: "El gasto se ha eliminado correctamente",
      });
      await refreshBudget();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el gasto",
      });
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedExpense(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando presupuesto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">
          Error al cargar los datos del presupuesto
        </p>
        <Button 
          onClick={refreshBudget}
          variant="outline"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Presupuesto</h1>
        <Button 
          onClick={handleAddNew}
          disabled={isMutating}
        >
          {isMutating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Nuevo Gasto"
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(Number(budget?.total) || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalExpenses > (Number(budget?.total) || 0) ? 'text-destructive' : ''}`}>
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
              {formatCurrency(remaining)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budget?.expenses?.length > 0 ? (
          budget.expenses.map((expense) => (
            <Card key={expense.id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {expense.concept}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Monto: {formatCurrency(Number(expense.amount))}
                  </p>
                  <p className="text-sm">
                    Fecha: {formatDate(expense.date)}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                      disabled={isMutating}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      disabled={isMutating}
                    >
                      {isMutating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p>No hay gastos registrados</p>
            <Button 
              onClick={handleAddNew}
              className="mt-4"
              disabled={isMutating}
            >
              Registrar primer gasto
            </Button>
          </div>
        )}
      </div>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isMutating) setDialogOpen(open);
        }}
        onSubmit={handleSubmit}
        expense={selectedExpense}
        budgetId={budget?.id}
        isProcessing={isMutating}
        remainingBudget={remaining}
      />
    </div>
  );
}