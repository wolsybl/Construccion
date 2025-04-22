import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Agregar este import
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react"; // Agregar ArrowLeft

export function TasksPage() {
  const navigate = useNavigate(); // Agregar hook de navegación
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    isLoading, 
    error,
    refreshTasks 
  } = useTasks();
  
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (taskData) => {
    setIsProcessing(true);
    try {
      if (selectedTask?.id) {
        await updateTask(selectedTask.id, taskData);
        toast({
          title: "Tarea actualizada",
          description: "La tarea se ha actualizado correctamente",
        });
      } else {
        await addTask(taskData);
        toast({
          title: "Tarea creada",
          description: "La tarea se ha creado correctamente",
        });
      }
      setDialogOpen(false);
      setSelectedTask(null);
      await refreshTasks();
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la tarea",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    setIsProcessing(true);
    try {
      await deleteTask(id);
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado correctamente",
      });
      await refreshTasks();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la tarea",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNew = () => {
    setSelectedTask(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando tareas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-destructive">
        <p>Error al cargar tareas: {error.message}</p>
        <Button 
          onClick={refreshTasks} 
          variant="outline" 
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
        </div>
        <Button onClick={handleAddNew} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Nueva Tarea"
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle className="text-xl">{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {task.description || "Sin descripción"}
                  </p>
                  <p className="text-sm">
                    Asignado a: {task.assigned_to?.name || "No asignado"}
                  </p>
                  <p className="text-sm">
                    Fecha límite: {task.due_date ? formatDate(task.due_date) : "Sin fecha"}
                  </p>
                  <p className="text-sm">
                    Estado: <span className="capitalize">{task.status}</span>
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(task)}
                      disabled={isProcessing}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p>No hay tareas disponibles</p>
            <Button 
              onClick={handleAddNew} 
              className="mt-4"
              disabled={isProcessing}
            >
              Crear primera tarea
            </Button>
          </div>
        )}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        task={selectedTask}
        isProcessing={isProcessing}
      />
    </div>
  );
}
