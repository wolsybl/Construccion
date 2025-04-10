import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { UserDialog } from "@/components/users/user-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import axios from "axios"

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    // Cargar usuarios desde la base de datos
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users")
        setUsers(response.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios",
        })
      }
    }
    fetchUsers()
  }, [])

  if (currentUser?.role !== "SuperAdmin") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Acceso Denegado
        </h1>
        <p className="mt-2">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    )
  }

  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        // Actualizar usuario existente
        const response = await axios.put(`/api/users/${selectedUser.id}`, userData)
        setUsers(users.map(user => 
          user.id === selectedUser.id ? response.data : user
        ))
        toast({
          title: "Usuario actualizado",
          description: "El usuario se ha actualizado correctamente",
        })
      } else {
        // Crear nuevo usuario
        const response = await axios.post("/api/users", userData)
        setUsers([...users, response.data])
        toast({
          title: "Usuario creado",
          description: "El usuario se ha creado correctamente",
        })
      }
      setDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el usuario",
      })
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`)
      setUsers(users.filter(user => user.id !== id))
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario",
      })
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setDialogOpen(true)}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="text-xl">{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Usuario: {user.username}</p>
                <p className="text-sm">Email: {user.email}</p>
                <p className="text-sm">Rol: {user.role}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        user={selectedUser}
      />
    </div>
  )
}