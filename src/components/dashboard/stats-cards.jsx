import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Package, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

const statsConfig = {
  "1": [ //admin
    { title: "Proyectos Activos", value: "loading...", icon: Building2, color: "text-blue-600", isProjectCount: true },
    { title: "Personal Total", value: "loading...", icon: Users, color: "text-green-600", isUserCount: true },
    { title: "Presupuesto Total", value: "loading...", icon: FileText, color: "text-yellow-600", isBudgetTotal: true },
    { title: "Tareas en Proceso", value: "loading...", icon: Package, color: "text-purple-600", isTaskCount: true },
  ],
  "2": [ // jefe de obra
    { title: "Personal Activo", value: "32", icon: Users, color: "text-blue-600" },
    { title: "Tareas Pendientes", value: "12", icon: FileText, color: "text-yellow-600" },
    { title: "Asistencia Hoy", value: "28", icon: Users, color: "text-green-600" },
    { title: "Incidencias", value: "2", icon: Package, color: "text-red-600" },
  ],
  "3": [ // gerente
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
  ]
}

export function StatsCards({ role }) {
  const [stats, setStats] = useState(statsConfig[role] || [])

  useEffect(() => {
    async function fetchCounts() {
      if (role === "1") { // Solo para administrador
        try {
          // Fetch project count
          const { count: projectCount, error: projectError } = await supabase
            .from('projects')
            .select('*', { count: 'exact' })

          if (projectError) throw projectError

          // Fetch user count
          const { count: userCount, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact' })

          if (userError) throw userError

          // Fetch tasks in progress count
          const { count: taskCount, error: taskError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact' })
            .eq('status', 'pendiente')

          if (taskError) throw taskError

          // Fetch total budget
          const { data: budgetData, error: budgetError } = await supabase
            .from('budget')
            .select('total')

          if (budgetError) throw budgetError

          // Calculate total budget
          const totalBudget = budgetData.reduce((sum, budget) => sum + (budget.total || 0), 0)

          setStats(currentStats => 
            currentStats.map(stat => {
              if (stat.isProjectCount) {
                return { ...stat, value: projectCount.toString() }
              }
              if (stat.isUserCount) {
                return { ...stat, value: userCount.toString() }
              }
              if (stat.isTaskCount) {
                return { ...stat, value: taskCount.toString() }
              }
              if (stat.isBudgetTotal) {
                return { ...stat, value: `$${totalBudget.toLocaleString()}` }
              }
              return stat
            })
          )
        } catch (error) {
          console.error('Error fetching counts:', error)
          setStats(currentStats =>
            currentStats.map(stat => ({
              ...stat,
              value: stat.isProjectCount || stat.isUserCount || stat.isTaskCount || stat.isBudgetTotal
                ? 'Error'
                : stat.value
            }))
          )
        }
      }
    }

    fetchCounts()
  }, [role])

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
            <div className="text-2xl font-bold">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
