
import { useLocalStorage } from "./use-local-storage"

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage("tasks", [])

  const addTask = (task) => {
    setTasks([...tasks, { 
      ...task, 
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: task.status || "pendiente",
      priority: task.priority || "media"
    }])
  }

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        ...updates,
        updatedAt: new Date().toISOString() 
      } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const getTasksByWorker = (workerName) => {
    return tasks.filter(task => task.assignedTo === workerName)
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const getTasksByPriority = (priority) => {
    return tasks.filter(task => task.priority === priority)
  }

  return { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask,
    getTasksByWorker,
    getTasksByStatus,
    getTasksByPriority
  }
}
