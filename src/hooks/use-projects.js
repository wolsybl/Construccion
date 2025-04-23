import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          created_at,
          updated_at,
          budget:budget_id (total)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("Ningún proyecto encontrado");
        setProjects([]);
        return;
      }
      
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProjectById = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          budget:budget_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) {
        console.log(`Ningún proyecto encontrado con el id: ${id}`);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error fetching project:", err);
      throw err;
    }
  }, []);

  const addProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchProjects(); // Actualizar lista
      return data;
    } catch (err) {
      console.error("Error adding project:", err);
      throw err;
    }
  };

  const createProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();

      if (error) throw error;
      
      await fetchProjects(); // Actualizar lista
      return data[0];
    } catch (err) {
      console.error("Error creating project:", err);
      throw err;
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      await fetchProjects(); // Actualizar lista
      return data[0];
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProjects(); // Actualizar lista
    } catch (err) {
      console.error("Error deleting project:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    getProjectById,
    addProject,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects
  };
}