import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

// Agregamos el mismo mapeo de roles que usa el sidebar
const ROLE_MAPPING = {
  1: "Administrador",
  2: "Jefe de Obra",
  3: "Gerente de Proyecto",
  4: "Trabajador"
}

// Mensajes personalizados por rol
const ROLE_MESSAGES = {
  Administrador: "Desde aquí puede gestionar usuarios, tareas, inventario y presupuestos del sistema.",
  "Jefe de Obra": "Gestione las tareas del equipo, la asistencia y los horarios de trabajo.",
  "Gerente de Proyecto": "Supervise los presupuestos, genere reportes y monitoree el progreso del proyecto.",
  Trabajador: "Visualice sus tareas asignadas y registre su asistencia diaria."
}

export function WelcomeCard({ user, role }) {
  const getCurrentTime = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "buenos días"
    if (hour < 18) return "buenas tardes"
    return "buenas noches"
  }

  if (!user) return null

  const roleName = ROLE_MAPPING[role] || "Trabajador"
  const roleMessage = ROLE_MESSAGES[roleName]

  return (
    <Card>
      <CardHeader>
        <CardTitle>¡Hola, {roleName}!</CardTitle>
        <CardDescription>
          Le deseamos {getCurrentTime()}, {roleName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {roleMessage}
        </p>
      </CardContent>
    </Card>
  )
}
