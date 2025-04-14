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
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          // Consulta directa sin depender de políticas RLS
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .maybeSingle()
            .abortSignal(new AbortController().signal); // Previene llamadas prolongadas
    
          if (profileError) {
            console.error("Error en consulta:", profileError);
            await supabase.auth.signOut();
            return; // Evita navegar para prevenir bucles
          }
    
          if (!profile) {
            console.warn("Perfil no encontrado para:", session.user.id);
            await supabase.auth.signOut();
            return;
          }
    
          setUser(session.user);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error en checkAuth:", error);
      } finally {
        setLoading(false);
      }
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
            .maybeSingle();
          
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
  
      if (authError) {
        console.error('Error en supabase.auth:', authError);
        throw authError;
      }
  
      // 2. Obtener perfil desde tu tabla users (cambiar a maybeSingle)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .maybeSingle(); // Cambiado a maybeSingle
  
      if (profileError) {
        console.error('Error en consulta users:', profileError);
        throw new Error("Error al cargar el perfil de usuario");
      }
  
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("No se encontró perfil de usuario asociado");
      }
  
      setUser(data.user);
      setUserProfile(profile);
      navigate('/dashboard');
      
      return { user: data.user, profile };
    } catch (error) {
      console.error('Error completo en login:', {
        message: error.message,
        stack: error.stack,
        originalError: error
      });
      throw error;
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