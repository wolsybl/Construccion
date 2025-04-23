import React, { useState } from "react"
import { useNavigate } from "react-router-dom" // Add this import
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InventoryDialog } from "@/components/inventory/inventory-dialog"
import { useInventory } from "@/hooks/use-inventory"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function InventoryPage() {
  const navigate = useNavigate() // Add this hook
  const { 
    inventory, 
    addItem, 
    updateItem, 
    deleteItem, 
    isLoading, 
    error,
    getLowStockItems 
  } = useInventory()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleSubmit = async (itemData) => {
    try {
      if (selectedItem) {
        await updateItem(selectedItem, itemData)
        toast({
          title: "Material actualizado",
          description: "El material se ha actualizado correctamente",
        })
      } else {
        await addItem(itemData)
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
        description: error.message || "No se pudo guardar el material",
      })
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item.id) // Now we only store the ID
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteItem(id)
      toast({
        title: "Material eliminado",
        description: "El material se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el material",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando inventario...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error al cargar el inventario: {error}</p>
      </div>
    )
  }

  const lowStockItems = getLowStockItems()

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
          <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          Nuevo Material
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-yellow-800 font-semibold mb-2">
            Materiales con stock bajo
          </h2>
          <ul className="space-y-1">
            {lowStockItems.map(item => (
              <li key={item.id} className="text-yellow-700">
                {item.name} - Cantidad actual: {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-xl">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Descripción: {item.description}</p>
                <p className="text-sm">Categoría: {item.category}</p>
                <p className="text-sm">Cantidad: {item.quantity} {item.unit}</p>
                <p className="text-sm">Costo unitario: ${item.unit_cost}</p>
                <p className="text-sm">Valor total: ${item.total_value}</p>
                <p className="text-sm">Stock Mínimo: {item.minimum_stock} {item.unit}</p>
                {item.supplier && (
                  <p className="text-sm">Proveedor: {item.supplier}</p>
                )}
                {item.location && (
                  <p className="text-sm">Ubicación: {item.location}</p>
                )}
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
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedItem(null)
        }}
        onSubmit={handleSubmit}
        itemId={selectedItem} // Pass itemId instead of whole item
      />
    </div>
  )
}
