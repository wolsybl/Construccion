
import React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { useAuth } from "@/hooks/use-auth"

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
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <img  alt="Gráfico de progreso" className="w-full h-[300px] rounded-lg object-cover" src="https://images.unsplash.com/photo-1616261167032-b16d2df8333b" />
            </div>
            <div className="col-span-3">
              <img  alt="Calendario de actividades" className="w-full h-[300px] rounded-lg object-cover" src="https://images.unsplash.com/photo-1649433391719-2e784576d044" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
