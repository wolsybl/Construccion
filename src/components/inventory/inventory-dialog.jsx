
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

export function InventoryDialog({ open, onOpenChange, onSubmit, item = {} }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      name: formData.get("name"),
      quantity: Number(formData.get("quantity")),
      minStock: Number(formData.get("minStock")),
      unit: formData.get("unit"),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item.id ? "Editar Material" : "Nuevo Material"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Material</Label>
              <Input
                id="name"
                name="name"
                defaultValue={item.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                defaultValue={item.quantity}
                required
              />
            </div>
            <div>
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                min="0"
                defaultValue={item.minStock}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidad de Medida</Label>
              <Input
                id="unit"
                name="unit"
                defaultValue={item.unit}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">
              {item.id ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
