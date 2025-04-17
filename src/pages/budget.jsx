import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpenseDialog } from "@/components/budget/expense-dialog";
import { IncomeDialog } from "@/components/budget/income-dialog";
import { useBudget } from "@/hooks/use-budget";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom"; // Add this import at the top

export function BudgetPage() {
  const navigate = useNavigate(); // Add this hook
  const { 
    budget, 
    addExpense, 
    updateExpense, 
    addIncome,      // Agregar
    updateIncome,   // Agregar
    isLoading,
    error,
    isMutating,
    refreshBudget
  } = useBudget();

  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  // Cálculo de totales con validación adicional
  const totalExpenses = budget?.expenses?.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0), 
    0
  ) || 0;

  const totalIncomes = budget?.incomes?.reduce(
    (sum, income) => sum + (Number(income.amount) || 0), 
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
      // Primero obtenemos el gasto para saber su monto
      const {error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Eliminamos el gasto de la base de datos
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Actualizamos el estado local
      await refreshBudget();

      toast({
        title: "Gasto eliminado",
        description: "El gasto se ha eliminado correctamente"
      });
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el gasto: " + error.message
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

  const handleIncomeSubmit = async (incomeData) => {
    try {
      if (selectedIncome?.id) {
        // Si estamos editando, usamos la operación directa con Supabase
        const { data, error } = await supabase
          .from('incomes')
          .update({
            concept: incomeData.concept,
            amount: incomeData.amount,
            date: incomeData.date,
            budget_id: incomeData.budget_id
          })
          .eq('id', selectedIncome.id)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Ingreso actualizado",
          description: "El ingreso se ha actualizado correctamente",
        });
      } else {
        // Si es nuevo, insertamos
        const { data, error } = await supabase
          .from('incomes')
          .insert([incomeData])
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Ingreso registrado",
          description: "El ingreso se ha registrado correctamente",
        });
      }
      
      setIncomeDialogOpen(false);
      setSelectedIncome(null);
      await refreshBudget();
    } catch (error) {
      console.error("Error saving income:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el ingreso",
      });
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refreshBudget();
      toast({
        title: "Ingreso eliminado",
        description: "El ingreso se ha eliminado correctamente"
      });
    } catch (error) {
      console.error("Error al eliminar el ingreso:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el ingreso: " + error.message
      });
    }
  };

  const handleEditIncome = (income) => {
    setSelectedIncome(income);
    setIncomeDialogOpen(true);
  };

  const handleAddNewIncome = () => {
    setSelectedIncome(null);
    setIncomeDialogOpen(true);
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Presupuesto</h1>
        </div>
        <div className="space-x-4">
          <Button 
            onClick={handleAddNew}
            disabled={isMutating}
          >
            Nuevo Gasto
          </Button>
          <Button 
            onClick={handleAddNewIncome}
            disabled={isMutating}
            variant="outline"
          >
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncomes)}
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

      {/* Sección de Gastos */}
      <h2 className="text-2xl font-bold mt-8">Gastos</h2>
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

      {/* Nueva Sección de Ingresos */}
      <h2 className="text-2xl font-bold mt-8">Ingresos</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budget?.incomes?.length > 0 ? (
          budget.incomes.map((income) => (
            <Card key={income.id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {income.concept}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    Monto: {formatCurrency(Number(income.amount))}
                  </p>
                  <p className="text-sm">
                    Fecha: {formatDate(income.date)}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditIncome(income)}
                      disabled={isMutating}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteIncome(income.id)}
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
            <p>No hay ingresos registrados</p>
            <Button 
              onClick={handleAddNewIncome}
              className="mt-4"
              disabled={isMutating}
            >
              Registrar primer ingreso
            </Button>
          </div>
        )}
      </div>

      <IncomeDialog
        open={incomeDialogOpen}
        onOpenChange={(open) => {
          if (!isMutating) setIncomeDialogOpen(open);
        }}
        onSubmit={handleIncomeSubmit}
        income={selectedIncome}
        budgetId={budget?.id}
      />

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