// filepath: src/hooks/use-auth.jsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";

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
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Error en el inicio de sesión:", error.message);
      throw new Error(error.message);
    }

    // Obtener el rol del usuario autenticado
    const { user } = data;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error("Error al obtener el rol del usuario:", userError.message);
      throw new Error(userError.message);
    }

    // Agregar el rol al estado del usuario
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