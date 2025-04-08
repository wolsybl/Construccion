
import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export function WelcomeCard({ user }) {
  const getCurrentTime = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "buenos días"
    if (hour < 18) return "buenas tardes"
    return "buenas noches"
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>¡Hola, {user.name}!</CardTitle>
        <CardDescription>
          Le deseamos {getCurrentTime()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Bienvenido al panel de control. Aquí podrá gestionar todas sus actividades como {user.role}.
        </p>
      </CardContent>
    </Card>
  )
}
