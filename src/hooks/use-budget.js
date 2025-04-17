import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useBudget() {
  const [budget, setBudget] = useState({ 
    total: 0, 
    expenses: [],
    incomes: [] // Incluir ingresos en el estado inicial
  });
  const [budgets, setBudgets] = useState([]); // Nuevo estado para la lista de presupuestos
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const handleSupabaseError = (error) => {
    if (error.code === '406') {
      return {
        ...error,
        message: "Error de permisos: Configura las políticas RLS en Supabase"
      };
    }
    return error;
  };

  const fetchBudgetData = useCallback(async () => {
    try {
      const [
        { data: budgetData, error: budgetError },
        { data: expensesData, error: expensesError },
        { data: incomesData, error: incomesError } // Agregar consulta de ingresos
      ] = await Promise.all([
        supabase.from("budget").select("*").single(),
        supabase.from("expenses").select("*"),
        supabase.from("incomes").select("*") // Nueva consulta para ingresos
      ]);

      const error = budgetError || expensesError || incomesError;
      if (error) throw handleSupabaseError(error);

      setBudget({
        ...budgetData,
        total: budgetData?.total || 0,
        expenses: expensesData || [],
        incomes: incomesData || [] // Agregar ingresos al estado
      });
    } catch (err) {
      console.error("Error fetching budget data:", err);
      setError(err);
      setBudget({ total: 0, expenses: [], incomes: [] }); // Incluir incomes en el estado por defecto
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Nueva función para obtener todos los presupuestos
  const fetchAllBudgets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("budget")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) throw handleSupabaseError(error);
      
      // Agregar console.log para mostrar los IDs
      console.log("Presupuestos encontrados:", data?.map(budget => ({
        id: budget.id,
        name: budget.budget_name,
        total: budget.total
      })));
      
      setBudgets(data || []);
      return data;
    } catch (err) {
      console.error("Error fetching budgets:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchBudgetData();
    fetchAllBudgets(); // Cargar los presupuestos al montar el componente
  }, [fetchBudgetData, fetchAllBudgets]);

  const addExpense = async (expense) => {
    setIsMutating(true);
    try {
      if (!expense.budget_id) {
        throw new Error("Se requiere un ID de presupuesto para crear un gasto");
      }

      // 1. Primero verificamos el presupuesto seleccionado
      const { data: budgetData, error: budgetError } = await supabase
        .from("budget")
        .select("total")
        .eq("id", expense.budget_id)
        .single();

      if (budgetError) throw handleSupabaseError(budgetError);
      if (!budgetData) throw new Error("Presupuesto no encontrado");

      // 2. Verificamos si hay suficiente presupuesto
      if (expense.amount > budgetData.total) {
        throw new Error("El monto del gasto excede el presupuesto disponible");
      }

      // 3. Creamos el nuevo gasto
      const newExpense = {
        concept: expense.concept,
        amount: expense.amount,
        date: expense.date || new Date().toISOString().split('T')[0],
        budget_id: expense.budget_id
      };

      // 4. Insertamos el gasto en la tabla expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .insert(newExpense)
        .select()
        .single();

      if (expenseError) throw handleSupabaseError(expenseError);

      // 5. Actualizamos el total del presupuesto
      const newTotal = budgetData.total - expense.amount;
      const { error: updateError } = await supabase
        .from("budget")
        .update({ total: newTotal })
        .eq("id", expense.budget_id);

      if (updateError) throw handleSupabaseError(updateError);

      // 6. Actualizamos el estado local
      setBudget(prev => ({
        ...prev,
        expenses: [expenseData, ...prev.expenses]
      }));

      // 7. Refrescamos los datos
      await fetchBudgetData();
      await fetchAllBudgets();

      return expenseData;
    } catch (err) {
      console.error("Error adding expense:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const updateExpense = async (id, updates) => {
    setIsMutating(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) throw handleSupabaseError(error);

      setBudget(prev => ({
        ...prev,
        expenses: prev.expenses.map(exp => 
          exp.id === id ? data[0] : exp
        )
      }));
      return data[0];
    } catch (err) {
      console.error("Error updating expense:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteExpense = async (id) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) throw handleSupabaseError(error);

      setBudget(prev => ({
        ...prev,
        expenses: prev.expenses.filter(exp => exp.id !== id)
      }));
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const setTotalBudget = async (total) => {
    setIsMutating(true);
    try {
      const { data, error } = await supabase
        .from("budget")
        .upsert({ 
          id: 1, 
          total,
          updated_at: new Date().toISOString() 
        })
        .select();

      if (error) throw handleSupabaseError(error);

      setBudget(prev => ({
        ...prev,
        total: data[0]?.total || total
      }));
      return data[0]?.total;
    } catch (err) {
      console.error("Error setting budget:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    budget,
    budgets, // Exponemos los presupuestos
    isLoading,
    error,
    isMutating,
    addExpense,
    updateExpense,
    deleteExpense,
    setTotalBudget,
    refreshBudget: fetchBudgetData,
    refreshBudgets: fetchAllBudgets // Exponemos la función para actualizar presupuestos
  };
}