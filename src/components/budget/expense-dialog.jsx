import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useBudget } from "@/hooks/use-budget" // Importamos el hook

export function ExpenseDialog({ open, onOpenChange, onSubmit, expense }) {
  const { toast } = useToast()
  const { budgets } = useBudget() // Obtenemos la lista de presupuestos
  const isEditing = Boolean(expense?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    const expenseData = {
      concept: formData.get("concept"),
      amount: Number(formData.get("amount")),
      date: formData.get("date"),
      budget_id: formData.get("budget_id") // Obtenemos el presupuesto seleccionado
    }

    try {
      let result
      if (isEditing) {
        const { data, error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id)
          .select()
          .single()
        
        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .insert(expenseData)
          .select()
          .single()
        
        if (error) throw error
        result = data
      }

      onSubmit(result)
      toast({
        title: isEditing ? "Gasto actualizado" : "Gasto creado",
        description: "La operación se realizó con éxito"
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Selector de presupuesto */}
            <div>
              <Label htmlFor="budget_id">Presupuesto</Label>
              <Select
                name="budget_id"
                defaultValue={expense?.budget_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.name || `Presupuesto #${budget.id} - ${budget.total}`}
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
                defaultValue={expense?.date || new Date().toISOString().split("T")[0]}
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
  )
}
