import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" // Asegúrate de que Supabase esté configurado correctamente

export function useInventory() {
  const [inventory, setInventory] = useState([])

  // Cargar inventario desde la base de datos al montar el hook
  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("inventory") // Nombre de la tabla en Supabase
        .select("*")

      if (error) {
        console.error("Error fetching inventory:", error)
      } else {
        setInventory(data)
      }
    }

    fetchInventory()
  }, [])

  const addItem = async (item) => {
    const newItem = {
      ...item,
      createdAt: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("inventory")
      .insert(newItem)

    if (error) {
      console.error("Error adding item:", error)
    } else {
      setInventory([...inventory, data[0]])
    }
  }

  const updateItem = async (id, updates) => {
    const { data, error } = await supabase
      .from("inventory")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating item:", error)
    } else {
      setInventory(inventory.map(item => (item.id === id ? data[0] : item)))
    }
  }

  const deleteItem = async (id) => {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting item:", error)
    } else {
      setInventory(inventory.filter(item => item.id !== id))
    }
  }

  return { inventory, addItem, updateItem, deleteItem }
}
