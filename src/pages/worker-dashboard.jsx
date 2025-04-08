
import React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { useAttendance } from "@/hooks/use-attendance"
import { useTasks } from "@/hooks/use-tasks"
import { formatDate } from "@/lib/utils"

export function WorkerDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const { attendance, registerEntry, registerExit } = useAttendance()
  const { tasks } = useTasks()

  if (!user) return null

  const todayAttendance = attendance.filter(
    a => a.employeeId === user.id && 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  )

  const hasEntryToday = todayAttendance.some(a => a.type === "entry")
  const hasExitToday = todayAttendance.some(a => a.type === "exit")

  const handleEntry = () => {
    try {
      registerEntry(user.id)
      toast({
        title: "Entrada registrada",
        description: "Se ha registrado tu entrada correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la entrada",
      })
    }
  }

  const handleExit = () => {
    try {
      registerExit(user.id)
      toast({
        title: "Salida registrada",
        description: "Se ha registrado tu salida correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la salida",
      })
    }
  }

  const myTasks = tasks.filter(task => task.assignedTo === user.name)

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, {user.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.position} - Proyecto #{user.projectId}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Registro de Asistencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Registro de Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  onClick={handleEntry}
                  disabled={hasEntryToday}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleExit}
                  disabled={!hasEntryToday || hasExitToday}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Registrar Salida
                </Button>
              </div>
              {todayAttendance.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Registros de hoy:</h3>
                  {todayAttendance.map((record, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {record.type === "entry" ? "Entrada" : "Salida"}: {
                        new Date(record.timestamp).toLocaleTimeString()
                      }
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tareas Asignadas */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No tienes tareas asignadas actualmente.
                  </p>
                ) : (
                  myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Estado: {task.status}</span>
                        <span>Fecha límite: {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
