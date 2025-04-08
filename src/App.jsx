
import React from "react"
import { LoginPage } from "@/pages/login"
import { Dashboard } from "@/pages/dashboard"
import { TasksPage } from "@/pages/tasks"
import { InventoryPage } from "@/pages/inventory"
import { BudgetPage } from "@/pages/budget"
import { UsersPage } from "@/pages/users"
import { WorkerDashboard } from "@/pages/worker-dashboard"
import { AuthProvider, useAuth } from "@/hooks/use-auth"

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  // Si el usuario es un trabajador, mostrar su dashboard específico
  if (user.role === "Trabajador") {
    return <WorkerDashboard />
  }

  const renderPage = () => {
    switch (window.location.pathname) {
      case "/tasks":
        return <TasksPage />
      case "/inventory":
        return <InventoryPage />
      case "/budget":
        return <BudgetPage />
      case "/users":
        return <UsersPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
