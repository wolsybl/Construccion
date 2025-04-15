import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useBudget() {
  const [budget, setBudget] = useState({ 
    total: 0, 
    expenses: [] 
  });
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
    setIsLoading(true);
    setError(null);
    try {
      const [
        { data: budgetData, error: budgetError },
        { data: expensesData, error: expensesError }
      ] = await Promise.all([
        supabase.from("budget").select("*").single(),
        supabase.from("expenses").select("*")
      ]);

      const error = budgetError || expensesError;
      if (error) throw handleSupabaseError(error);

      setBudget({
        total: budgetData?.total || 0,
        expenses: expensesData || []
      });
    } catch (err) {
      console.error("Error fetching budget data:", err);
      setError(err);
      setBudget({ total: 0, expenses: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const addExpense = async (expense) => {
    setIsMutating(true);
    try {
      const newExpense = {
        ...expense,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert(newExpense)
        .select();

      if (error) throw handleSupabaseError(error);

      setBudget(prev => ({
        ...prev,
        expenses: [data[0], ...prev.expenses]
      }));
      return data[0];
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
    isLoading,
    error,
    isMutating,
    addExpense,
    updateExpense,
    deleteExpense,
    setTotalBudget,
    refreshBudget: fetchBudgetData
  };
}