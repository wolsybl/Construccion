
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { useTasks } from "@/hooks/use-tasks"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const handleSubmit = (taskData) => {
    try {
      if (selectedTask?.id) {
        updateTask(selectedTask.id, taskData)
        toast({
          title: "Tarea actualizada",
          description: "La tarea se ha actualizado correctamente",
        })
      } else {
        addTask(taskData)
        toast({
          title: "Tarea creada",
          description: "La tarea se ha creado correctamente",
        })
      }
      setDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la tarea",
      })
    }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  const handleDelete = (id) => {
    try {
      deleteTask(id)
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la tarea",
      })
    }
  }

  const handleAddNew = () => {
    setSelectedTask(null)
    setDialogOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
        <Button onClick={handleAddNew}>
          Nueva Tarea
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="text-xl">{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <p className="text-sm">Asignado a: {task.assignedTo}</p>
                <p className="text-sm">Fecha límite: {formatDate(task.dueDate)}</p>
                <p className="text-sm">Estado: {task.status}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        task={selectedTask}
      />
    </div>
  )
}
