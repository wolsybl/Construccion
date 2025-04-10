import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { setSelectedRole } from "@/lib/role"; // Importamos la función para almacenar el rol seleccionado

export function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [role, setRole] = useState(""); // Estado para el rol seleccionado

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setSelectedRole(selectedRole); // Guardamos el rol seleccionado en la variable global
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido al sistema como ${role}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al iniciar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Selecciona tu rol</Label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={handleRoleChange}
          required
          className="w-full border rounded px-3 py-2"
        >
          <option value="" disabled>
            Selecciona un rol
          </option>
          <option value="trabajador">Trabajador</option>
          <option value="jefe de obra">Jefe de Obra</option>
          <option value="gerente">Gerente</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
