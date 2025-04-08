
import { useState, useEffect, createContext, useContext } from "react"
import { useLocalStorage } from "./use-local-storage"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage("user", null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular verificación de token
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      // Simular llamada a API
      const mockUsers = [
        { 
          id: 1, 
          username: "admin", 
          password: "admin123", 
          role: "SuperAdmin",
          name: "Administrador Principal",
          email: "admin@construccion.com",
          permissions: ["all"]
        },
        { 
          id: 2, 
          username: "jefe", 
          password: "jefe123", 
          role: "Jefe de Obra",
          name: "Jefe de Obra",
          email: "jefe@construccion.com",
          permissions: ["tasks", "attendance"]
        },
        { 
          id: 3, 
          username: "gerente", 
          password: "gerente123", 
          role: "Gerente de Proyecto",
          name: "Gerente de Proyecto",
          email: "gerente@construccion.com",
          permissions: ["budget", "reports"]
        }
      ]

      const user = mockUsers.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      )

      if (!user) {
        throw new Error("Credenciales inválidas")
      }

      const { password, ...userWithoutPassword } = user
      setUser(userWithoutPassword)
      return userWithoutPassword
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === "SuperAdmin") return true
    return user.permissions.includes(permission)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
