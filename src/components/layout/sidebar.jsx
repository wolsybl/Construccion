
import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  FileText,
  LogOut,
} from "lucide-react"

const menuItems = {
  Administrador: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Gestión de Personal", href: "/personal" },
    { icon: FileText, label: "Informes", href: "/informes" },
  ],
  "Jefe de Obra": [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ClipboardList, label: "Tareas", href: "/tasks" },
    { icon: Users, label: "Asistencia", href: "/asistencia" },
  ],
  "Gerente de Proyecto": [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: FileText, label: "Presupuestos", href: "/budget" },
    { icon: ClipboardList, label: "Gastos", href: "/gastos" },
  ],
  "Encargado de Suministros": [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Package, label: "Inventario", href: "/inventory" },
    { icon: ClipboardList, label: "Pedidos", href: "/pedidos" },
  ],
  "Director de Obra": [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: FileText, label: "Informes", href: "/informes" },
    { icon: ClipboardList, label: "Progreso", href: "/progreso" },
  ],
}

export function Sidebar({ className, role, onLogout }) {
  const items = menuItems[role] || []

  const handleNavigation = (href) => {
    window.location.href = href
  }

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menú Principal
          </h2>
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
