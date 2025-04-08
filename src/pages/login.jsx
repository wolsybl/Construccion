
import React from "react"
import { LoginForm } from "@/components/auth/login-form"

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema de Gestión de Construcción
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicie sesión para continuar
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
