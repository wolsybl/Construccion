
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Package, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const statsConfig = {
  Administrador: [
    { title: "Proyectos Activos", value: "8", icon: Building2, color: "text-blue-600" },
    { title: "Personal Total", value: "124", icon: Users, color: "text-green-600" },
    { title: "Informes Pendientes", value: "3", icon: FileText, color: "text-yellow-600" },
    { title: "Tareas en Proceso", value: "45", icon: Package, color: "text-purple-600" },
  ],
  "Jefe de Obra": [
    { title: "Personal Activo", value: "32", icon: Users, color: "text-blue-600" },
    { title: "Tareas Pendientes", value: "12", icon: FileText, color: "text-yellow-600" },
    { title: "Asistencia Hoy", value: "28", icon: Users, color: "text-green-600" },
    { title: "Incidencias", value: "2", icon: Package, color: "text-red-600" },
  ],
  "Gerente de Proyecto": [
    { title: "Presupuesto Total", value: "$1.2M", icon: Building2, color: "text-blue-600" },
    { title: "Gastos del Mes", value: "$85K", icon: FileText, color: "text-yellow-600" },
    { title: "Proveedores", value: "18", icon: Users, color: "text-green-600" },
    { title: "Facturas Pendientes", value: "7", icon: Package, color: "text-red-600" },
  ],
  "Encargado de Suministros": [
    { title: "Items en Stock", value: "234", icon: Package, color: "text-blue-600" },
    { title: "Pedidos Pendientes", value: "8", icon: FileText, color: "text-yellow-600" },
    { title: "Proveedores", value: "12", icon: Users, color: "text-green-600" },
    { title: "Alertas Stock", value: "3", icon: Package, color: "text-red-600" },
  ],
  "Director de Obra": [
    { title: "Avance Global", value: "75%", icon: Building2, color: "text-blue-600" },
    { title: "Proyectos", value: "3", icon: FileText, color: "text-yellow-600" },
    { title: "Personal Total", value: "87", icon: Users, color: "text-green-600" },
    { title: "Informes Nuevos", value: "5", icon: Package, color: "text-purple-600" },
  ],
  "SuperAdmin": [
    { title: "Usuarios Totales", value: "45", icon: Users, color: "text-blue-600" },
    { title: "Proyectos Activos", value: "12", icon: Building2, color: "text-green-600" },
    { title: "Reportes Pendientes", value: "8", icon: FileText, color: "text-yellow-600" },
    { title: "Alertas Sistema", value: "3", icon: Package, color: "text-red-600" },
  ],
}

export function StatsCards({ role }) {
  const stats = statsConfig[role] || []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
