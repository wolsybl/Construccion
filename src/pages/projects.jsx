import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ProjectDialog } from "@/components/projects/project-dialog"
import { useProjects } from "@/hooks/use-projects"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function ProjectsPage() {
  const navigate = useNavigate()
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    isLoading, 
    error,
    refreshProjects
  } = useProjects()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const handleSubmit = async (projectData) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, projectData)
        toast({
          title: "Proyecto actualizado",
          description: "El proyecto se ha actualizado correctamente",
        })
      } else {
        await addProject(projectData)
        toast({
          title: "Proyecto creado",
          description: "El proyecto se ha creado correctamente",
        })
      }
      setDialogOpen(false)
      setSelectedProject(null)
      await refreshProjects()
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar el proyecto",
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProject(id)
      await refreshProjects()
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el proyecto",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando proyectos...</span>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
        </div>
        <Button onClick={() => {
          setSelectedProject(null)
          setDialogOpen(true)
        }}>
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="text-xl">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{project.description}</p>
                {project.location && (
                  <p className="text-sm">Ubicación: {project.location}</p>
                )}
                <p className="text-sm">
                  Fecha de inicio: {new Date(project.start_date).toLocaleDateString()}
                </p>
                {project.end_date && (
                  <p className="text-sm">
                    Fecha de finalización: {new Date(project.end_date).toLocaleDateString()}
                  </p>
                )}
                <div className="flex justify-between items-center pt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tareas: {project.tasks?.count || 0}</p>
                    <p className="text-sm font-medium">Materiales: {project.inventory?.count || 0}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project)
                        setDialogOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        project={selectedProject}
      />
    </div>
  )
}