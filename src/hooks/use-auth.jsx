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
    return data.user;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  };

  const hasPermission = async (permissionName) => {
    if (!user) return false;
  
    try {
      // Consulta a la base de datos para verificar si el usuario tiene el permiso
      const { data, error } = await supabase
        .from('permissions')
        .select('id')
        .eq('name', permissionName)
        .limit(1);
  
      if (error) throw error;
  
      if (data.length === 0) {
        console.warn(`El permiso "${permissionName}" no existe en la base de datos.`);
        return false;
      }
  
      // Aquí puedes implementar lógica adicional para verificar si el usuario tiene el permiso
      // Por ejemplo, podrías tener una tabla que relacione usuarios con permisos o roles
      const permissionId = data[0].id;
  
      const { data: userPermissions, error: userError } = await supabase
        .from('user_permissions') // Supongamos que existe una tabla que relaciona usuarios con permisos
        .select('permission_id')
        .eq('user_id', user.id)
        .eq('permission_id', permissionId);
  
      if (userError) throw userError;
  
      return userPermissions.length > 0;
    } catch (err) {
      console.error('Error verificando permisos:', err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
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