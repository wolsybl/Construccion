import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Loader2 } from "lucide-react"

export function ProjectDialog({ open, onOpenChange, onSubmit, project = null }) {
  const { toast } = useToast()
  const { budgets, isLoading: loadingBudgets } = useBudget()

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const budgetId = formData.get("budget_id")
    
    onSubmit({
      name: formData.get("name").trim(),
      description: formData.get("description")?.trim(),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      budget_id: budgetId === "none" ? null : budgetId
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {project ? "Editar Proyecto" : "Nuevo Proyecto"}
          </DialogTitle>
          <DialogDescription>
            {project ? "Modifica los datos del proyecto" : "Ingresa los datos del nuevo proyecto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Proyecto *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              defaultValue={project?.description}
            />
          </div>
          <div>
            <Label htmlFor="budget_id">Presupuesto</Label>
            {loadingBudgets ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Cargando presupuestos...
                </span>
              </div>
            ) : (
              <Select 
                name="budget_id" 
                defaultValue={project?.budget_id?.toString() || "none"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin presupuesto</SelectItem>
                  {budgets?.map((budget) => (
                    <SelectItem 
                      key={budget.id} 
                      value={budget.id.toString()}
                    >
                      {budget.budget_name} - ${budget.total.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={project?.start_date}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Fecha de Finalización</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={project?.end_date}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {project ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}