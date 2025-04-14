import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom"; // Cambiado de next/router a react-router-dom

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Usando useNavigate de react-router-dom

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // 1. Verificar sesión existente
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 2. Obtener perfil del usuario desde tu tabla
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (error || !profile) {
          console.error("Perfil no encontrado:", error?.message);
          await supabase.auth.signOut();
          navigate('/login'); // Redirigir al login si no hay perfil
        } else {
          setUser(session.user);
          setUserProfile(profile);
        }
      }
      
      setLoading(false);
    };

    checkAuth();

    // 3. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
          
          setUser(session.user);
          setUserProfile(profile || null);
        } else {
          setUser(null);
          setUserProfile(null);
          navigate('/login'); // Redirigir al login al cerrar sesión
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]); // Añadido navigate como dependencia

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // 2. Obtener perfil desde tu tabla users
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Perfil de usuario no encontrado");
      }

      setUser(data.user);
      setUserProfile(profile);
      navigate('/dashboard'); // Redirección con react-router
      return { user: data.user, profile };
    } catch (error) {
      throw error; // El error será manejado por el componente LoginForm
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      navigate('/login'); // Redirección con react-router
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: userProfile, 
      login, 
      logout, 
      loading 
    }}>
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