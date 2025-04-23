import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
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
import { useProjects } from "@/hooks/use-projects"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Changed this line

export function InventoryDialog({ open, onOpenChange, onSubmit, itemId }) {
  const { toast } = useToast() // Add this line
  const { projects } = useProjects()
  const [item, setItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchItem() {
      if (!itemId) {
        setItem(null)
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('id', itemId)
          .single()

        if (error) throw error
        setItem(data)
      } catch (error) {
        console.error('Error fetching item:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el material"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [itemId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    onSubmit({
      id: itemId, // Include the ID for updates
      name: formData.get("name").trim(),
      description: formData.get("description")?.trim(),
      category: formData.get("category").trim(),
      quantity: Number(formData.get("quantity")),
      unit: formData.get("unit").trim(),
      unit_cost: Number(formData.get("unit_cost")),
      minimum_stock: Number(formData.get("minimum_stock")),
      project_id: formData.get("project_id") || null,
      supplier: formData.get("supplier")?.trim(),
      location: formData.get("location")?.trim(),
      notes: formData.get("notes")?.trim()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {itemId ? "Editar Material" : "Nuevo Material"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Material *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={item?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={item?.category}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="0.001"
                  defaultValue={item?.quantity}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unidad de Medida *</Label>
                <Input
                  id="unit"
                  name="unit"
                  defaultValue={item?.unit}
                  required
                  placeholder="kg, litros, metros, unidades"
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Costo Unitario *</Label>
                <Input
                  id="unit_cost"
                  name="unit_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={item?.unit_cost}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Stock Mínimo *</Label>
                <Input
                  id="minimum_stock"
                  name="minimum_stock"
                  type="number"
                  min="0"
                  step="0.001"
                  defaultValue={item?.minimum_stock}
                  required
                />
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  defaultValue={item?.supplier}
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={item?.location}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="project_id">Proyecto</Label>
                <Select name="project_id" defaultValue={item?.project_id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin proyecto</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={item?.description}
                  className="min-h-[80px]"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  name="notes"
                  defaultValue={item?.notes}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {itemId ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
