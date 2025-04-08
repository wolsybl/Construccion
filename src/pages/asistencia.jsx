
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useAttendance } from "@/hooks/use-attendance"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

export function AsistenciaPage() {
  const { attendance } = useAttendance()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Obtener lista de trabajadores del contexto de autenticación
  const { user: currentUser } = useAuth()
  const workers = [
    { id: 4, name: "Juan Pérez", position: "Albañil" },
    { id: 5, name: "María García", position: "Electricista" },
    // Aquí se pueden agregar más trabajadores
  ]

  // Filtrar asistencias por la fecha seleccionada
  const attendanceForDate = attendance.filter(record => 
    record.timestamp.split('T')[0] === selectedDate
  )

  // Agrupar asistencias por empleado
  const attendanceByEmployee = workers.map(worker => {
    const records = attendanceForDate.filter(record => record.employeeId === worker.id)
    const entry = records.find(r => r.type === "entry")
    const exit = records.find(r => r.type === "exit")
    
    return {
      ...worker,
      entry: entry?.timestamp,
      exit: exit?.timestamp,
      status: entry ? (exit ? "Completado" : "En trabajo") : "Ausente"
    }
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Control de Asistencia</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {attendanceByEmployee.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle className="text-xl">{employee.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Cargo: {employee.position}</p>
                <p className="text-sm">Estado: {employee.status}</p>
                {employee.entry && (
                  <p className="text-sm">
                    Entrada: {new Date(employee.entry).toLocaleTimeString()}
                  </p>
                )}
                {employee.exit && (
                  <p className="text-sm">
                    Salida: {new Date(employee.exit).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Resumen del Día</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Presentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {attendanceByEmployee.filter(e => e.status !== "Ausente").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>En Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {attendanceByEmployee.filter(e => e.status === "En trabajo").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ausentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {attendanceByEmployee.filter(e => e.status === "Ausente").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
