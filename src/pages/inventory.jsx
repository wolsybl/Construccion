
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InventoryDialog } from "@/components/inventory/inventory-dialog"
import { useInventory } from "@/hooks/use-inventory"
import { useToast } from "@/components/ui/use-toast"

export function InventoryPage() {
  const { inventory, addItem, updateItem, deleteItem } = useInventory()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleSubmit = (itemData) => {
    try {
      if (selectedItem) {
        updateItem(selectedItem.id, itemData)
        toast({
          title: "Material actualizado",
          description: "El material se ha actualizado correctamente",
        })
      } else {
        addItem(itemData)
        toast({
          title: "Material añadido",
          description: "El material se ha añadido correctamente",
        })
      }
      setDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el material",
      })
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleDelete = (id) => {
    try {
      deleteItem(id)
      toast({
        title: "Material eliminado",
        description: "El material se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el material",
      })
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
        <Button onClick={() => setDialogOpen(true)}>
          Nuevo Material
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-xl">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Cantidad: {item.quantity} {item.unit}</p>
                <p className="text-sm">Stock Mínimo: {item.minStock} {item.unit}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InventoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        item={selectedItem}
      />
    </div>
  )
}
