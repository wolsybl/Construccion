import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useInventory() {
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load inventory from database
  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          id,
          name,
          description,
          category,
          quantity,
          unit,
          unit_cost,
          total_value,
          minimum_stock,
          project_id,
          supplier,
          location,
          notes,
          created_at,
          updated_at,
          projects(id, name)
        `)
        .order('name')

      if (error) throw error

      setInventory(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (item) => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .insert({
          name: item.name,
          description: item.description,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          minimum_stock: item.minimum_stock,
          project_id: item.project_id,
          supplier: item.supplier,
          location: item.location,
          notes: item.notes
        })
        .select()
        .single()

      if (error) throw error

      setInventory([...inventory, data])
      return data
    } catch (error) {
      console.error("Error adding item:", error)
      throw error
    }
  }

  const updateItem = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      setInventory(inventory.map(item => 
        item.id === id ? data : item
      ))
      
      return data
    } catch (error) {
      console.error("Error updating item:", error)
      throw error
    }
  }

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id)

      if (error) throw error

      setInventory(inventory.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error deleting item:", error)
      throw error
    }
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minimum_stock)
  }

  const getItemsByCategory = (category) => {
    return inventory.filter(item => item.category === category)
  }

  const getItemsByProject = (projectId) => {
    return inventory.filter(item => item.project_id === projectId)
  }

  return {
    inventory,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshInventory: fetchInventory,
    getLowStockItems,
    getItemsByCategory,
    getItemsByProject
  }
}
