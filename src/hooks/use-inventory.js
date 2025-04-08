
import { useLocalStorage } from "./use-local-storage"

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage("inventory", [])

  const addItem = (item) => {
    setInventory([...inventory, { ...item, id: Date.now() }])
  }

  const updateItem = (id, updates) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const deleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id))
  }

  return { inventory, addItem, updateItem, deleteItem }
}
