import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  FileText,
  LogOut,
  UserCog,
  Clock,
  DollarSign,
  ClipboardCheck,
  Folder // Añadimos el icono para proyectos
} from "lucide-react"

// Mapeo de IDs de rol a nombres consistentes
const ROLE_MAPPING = {
  1: "Administrador",
  2: "Jefe de Obra",
  3: "Gerente de Proyecto",
  4: "Trabajador"
}

// Opciones de menú reorganizadas para coincidir con tus rutas existentes
const menuItems = {
  Administrador: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: UserCog, label: "Gestión de Usuarios", href: "/users" },
    { icon: Folder, label: "Proyectos", href: "/projects" }, // Añadimos Proyectos
    { icon: ClipboardList, label: "Tareas", href: "/tasks" },
    { icon: Package, label: "Inventario", href: "/inventory" },
    { icon: DollarSign, label: "Presupuestos", href: "/budget" }
  ],
  "Jefe de Obra": [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ClipboardList, label: "Tareas", href: "/tasks" },
    { icon: Users, label: "Asistencia", href: "/attendance" },
    { icon: Clock, label: "Horarios", href: "/schedules" }
  ],
  "Gerente de Proyecto": [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Folder, label: "Proyectos", href: "/projects" }, // Añadimos Proyectos
    { icon: DollarSign, label: "Presupuestos", href: "/budget" },
    { icon: Package, label: "Inventario", href: "/inventory" },
    { icon: ClipboardList, label: "Tareas", href: "/tasks" }
  ],
  Trabajador: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ClipboardList, label: "Mis Tareas", href: "/my-tasks" },
    { icon: Clock, label: "Mi Asistencia", href: "/my-attendance" }
  ]
}

export function Sidebar({ className, role, onLogout }) {
  const navigate = useNavigate()
  const roleName = ROLE_MAPPING[role] || "Trabajador"
  const items = menuItems[roleName] || []

  const handleNavigation = (href) => {
    navigate(href) // Usa react-router en lugar de window.location
  }

  return (
    <div className={cn("pb-12 min-h-screen flex flex-col justify-between", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menú {roleName}
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