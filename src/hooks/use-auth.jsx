// filepath: src/hooks/use-auth.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { getSelectedRole } from "@/lib/role"; // Importar la función para obtener el rol seleccionado

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    const selectedRole = getSelectedRole(); // Obtener el rol seleccionado por el usuario

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Error en el inicio de sesión:", error.message);
      throw new Error(error.message);
    }

    // Verificar si el usuario pertenece al rol seleccionado
    const { user } = data;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .eq('role', selectedRole) // Verificar que el rol coincida con el seleccionado
      .maybeSingle(); // Cambiado de .single() a .maybeSingle() para manejar casos de múltiples filas o ninguna

    if (userError || !userData) {
      console.error("El usuario no pertenece al rol seleccionado o no existe:", userError?.message);
      throw new Error("El usuario no pertenece al rol seleccionado o no existe.");
    }

    // Si el rol coincide, agregar el usuario al estado
    setUser({ ...user, role: userData.role });
    return { ...user, role: userData.role };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}