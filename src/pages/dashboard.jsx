import React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { useAuth } from "@/hooks/use-auth"
import MapComponent from "@/lib/maps" // Importar el componente de Google Maps

export function Dashboard() {
  const { user, profile, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64 border-r" role={profile?.role} onLogout={logout} />
      <main className="flex-1 p-8">
        <div className="space-y-8">
          <WelcomeCard user={user} role={profile?.role} />
          <StatsCards role={profile?.role} />
          
          <div className="grid gap-4">
            <div className="col-span-4">
              {/* Mostrar un solo mapa */}
              <MapComponent />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
