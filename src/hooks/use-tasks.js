import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" // Asegúrate de que Supabase esté configurado correctamente

export function useTasks() {
  const [tasks, setTasks] = useState([])

  // Cargar tareas desde la base de datos al montar el hook
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks") // Nombre de la tabla en Supabase
        .select("*")

      if (error) {
        console.error("Error fetching tasks:", error)
      } else {
        setTasks(data)
      }
    }

    fetchTasks()
  }, [])

  const addTask = async (task) => {
    const newTask = {
      ...task,
      createdAt: new Date().toISOString(),
      status: task.status || "pendiente",
      priority: task.priority || "media",
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert(newTask)

    if (error) {
      console.error("Error adding task:", error)
    } else {
      setTasks([...tasks, data[0]])
    }
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating task:", error)
    } else {
      setTasks(tasks.map(task => (task.id === id ? data[0] : task)))
    }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting task:", error)
    } else {
      setTasks(tasks.filter(task => task.id !== id))
    }
  }

  const getTasksByWorker = async (workerName) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assignedTo", workerName)

    if (error) {
      console.error("Error fetching tasks by worker:", error)
      return []
    }
    return data
  }

  const getTasksByStatus = async (status) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", status)

    if (error) {
      console.error("Error fetching tasks by status:", error)
      return []
    }
    return data
  }

  const getTasksByPriority = async (priority) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("priority", priority)

    if (error) {
      console.error("Error fetching tasks by priority:", error)
      return []
    }
    return data
  }

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksByWorker,
    getTasksByStatus,
    getTasksByPriority,
  }
}
