import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  // Función para cargar tareas con relaciones
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select(`
          *,
          assigned_to:assigned_to (id, name, email)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar tareas al montar y proveer función de refresco
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Añadir nueva tarea
  const addTask = async (taskData) => {
    setIsMutating(true);
    try {
      const newTask = {
        ...taskData,
        status: taskData.status || "pendiente",
        priority: taskData.priority || "media",
      };

      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert(newTask)
        .select(`
          *,
          assigned_to:assigned_to (id, name, email)
        `);

      if (insertError) throw insertError;
      
      setTasks(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      console.error("Error adding task:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  // Actualizar tarea existente
  const updateTask = async (id, updates) => {
    setIsMutating(true);
    try {
      const { data, error: updateError } = await supabase
        .from("tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          assigned_to:assigned_to (id, name, email)
        `);

      if (updateError) throw updateError;
      
      setTasks(prev => prev.map(task => 
        task.id === id ? data[0] : task
      ));
      return data[0];
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  // Eliminar tarea
  const deleteTask = async (id) => {
    setIsMutating(true);
    try {
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  // Filtros optimizados (ahora trabajan con datos locales)
  const getTasksByWorker = (workerId) => {
    return tasks.filter(task => task.assigned_to?.id === workerId);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByPriority = (priority) => {
    return tasks.filter(task => task.priority === priority);
  };

  return {
    tasks,
    isLoading,
    error,
    isMutating,
    addTask,
    updateTask,
    deleteTask,
    getTasksByWorker,
    getTasksByStatus,
    getTasksByPriority,
    refreshTasks: fetchTasks, // Para forzar recarga cuando sea necesario
  };
}