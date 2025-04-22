import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useBudget } from "@/hooks/use-budget"; // Importamos el hook
import { formatCurrency } from "@/lib/utils"; // Importamos la función para formatear moneda
import { supabase } from "@/lib/supabase";

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  budgetId,
  remainingBudget,
  onSuccess,
}) {
  const { toast } = useToast();
  const { budgets } = useBudget();
  const isEditing = Boolean(expense?.id);
  const [selectedBudgetId, setSelectedBudgetId] = useState(
    expense?.budget_id || budgetId
  );

  // Get the selected budget data
  const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = Number(formData.get("amount"));
    const budgetId = formData.get("budget_id");

    if (!isEditing && amount > remainingBudget) {
      toast({
        title: "Error",
        description: "El monto excede el presupuesto disponible",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBudget) {
      toast({
        title: "Error",
        description: "Por favor seleccione un presupuesto",
        variant: "destructive",
      });
      return;
    }

    const expenseData = {
      concept: formData.get("concept").trim(),
      amount: amount,
      date: formData.get("date"),
      budget_id: budgetId,
    };

    try {
      if (isEditing) {
        const { data: oldExpense } = await supabase
          .from("expenses")
          .select("amount")
          .eq("id", expense.id)
          .single();

        const amountDifference = Number(oldExpense.amount) - amount;

        // Actualizamos el gasto
        const { error: expenseError } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", expense.id);

        if (expenseError) throw expenseError;

        // Actualizamos el presupuesto
        const { error: budgetError } = await supabase
          .from("budget")
          .update({ total: Number(selectedBudget.total) + amountDifference })
          .eq("id", budgetId);

        if (budgetError) throw budgetError;
      } else {
        // Crear nuevo gasto
        const { error: expenseError } = await supabase
          .from("expenses")
          .insert([expenseData]);

        if (expenseError) throw expenseError;

        // Actualizar presupuesto
        const { error: budgetError } = await supabase
          .from("budget")
          .update({ total: Number(selectedBudget.total) - amount })
          .eq("id", budgetId);

        if (budgetError) throw budgetError;
      }

      toast({
        title: isEditing ? "Gasto actualizado" : "Gasto creado",
        description: "La operación se realizó con éxito",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el gasto",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
          {!isEditing && (
            <p className="text-sm text-muted-foreground">
              Presupuesto disponible: {formatCurrency(remainingBudget)}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Selector de presupuesto */}
            <div>
              <Label htmlFor="budget_id">Presupuesto</Label>
              <Select
                name="budget_id"
                defaultValue={selectedBudgetId}
                onValueChange={setSelectedBudgetId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.budget_name ||
                        `Presupuesto #${budget.id} - ${budget.total}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos existentes */}
            <div>
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                name="concept"
                defaultValue={expense?.concept || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={expense?.amount || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  expense?.date || new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
