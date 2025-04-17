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
import { useToast } from "@/components/ui/use-toast"
import { useBudget } from "@/hooks/use-budget"

export function IncomeDialog({ open, onOpenChange, onSubmit, income }) {
  const { toast } = useToast()
  const { budgets } = useBudget() // Get the budgets list
  const isEditing = Boolean(income?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    const incomeData = {
      concept: formData.get("concept").trim(),
      amount: Number(formData.get("amount")),
      date: formData.get("date"),
      budget_id: formData.get("budget_id")
    }

    try {
      // En lugar de hacer las operaciones de base de datos aquí,
      // pasamos los datos al componente padre
      onSubmit(incomeData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el ingreso",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Ingreso" : "Nuevo Ingreso"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Add budget selector at the top */}
            <div>
              <Label htmlFor="budget_id">Presupuesto</Label>
              <Select
                name="budget_id"
                defaultValue={income?.budget_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  {budgets?.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.budget_name || `Presupuesto #${budget.id} - ${budget.total}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                name="concept"
                defaultValue={income?.concept || ""}
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
                defaultValue={income?.amount || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={income?.date || new Date().toISOString().split("T")[0]}
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