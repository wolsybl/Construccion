import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function AsistenciaPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    present: 0,
    working: 0,
    absent: 0
  });

  // Obtener trabajadores desde Supabase
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, role')
          .eq('role', 'trabajador'); // Ajusta según tu estructura de roles

        if (error) throw error;
        setWorkers(data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los trabajadores",
        });
      }
    };

    fetchWorkers();
  }, [toast]);

  // Obtener asistencias desde Supabase
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .gte('date', `${selectedDate}T00:00:00`)
          .lte('date', `${selectedDate}T23:59:59`);

        if (error) throw error;
        setAttendance(data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las asistencias",
        });
      } finally {
        setLoading(false);
      }
    };

    if (workers.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, workers, toast]);

  // Calcular resumen
  useEffect(() => {
    if (workers.length > 0 && attendance.length >= 0) {
      const presentWorkers = workers.filter(worker => {
        return attendance.some(record => record.user_id === worker.id);
      });

      const workingWorkers = presentWorkers.filter(worker => {
        const records = attendance.filter(record => record.user_id === worker.id);
        return records.some(r => r.type === 'entry') && 
               !records.some(r => r.type === 'exit');
      });

      setSummary({
        present: presentWorkers.length,
        working: workingWorkers.length,
        absent: workers.length - presentWorkers.length
      });
    }
  }, [workers, attendance]);

  const handleRegisterAttendance = async (type) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .insert([{
          user_id: currentUser.id,
          type,
          date: new Date().toISOString(),
          status: type === 'entry' ? 'presente' : 'completado'
        }]);

      if (error) throw error;

      // Actualizar la lista de asistencias
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', `${selectedDate}T00:00:00`)
        .lte('date', `${selectedDate}T23:59:59`);

      setAttendance(data || []);

      toast({
        title: "Asistencia registrada",
        description: `Se ha registrado tu ${type === 'entry' ? 'entrada' : 'salida'}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar la asistencia",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Control de Asistencia</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-md"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Botones para registrar entrada/salida */}
      <div className="flex gap-4">
        <Button 
          onClick={() => handleRegisterAttendance('entry')}
          disabled={loading}
        >
          Registrar Entrada
        </Button>
        <Button 
          onClick={() => handleRegisterAttendance('exit')}
          disabled={loading}
          variant="outline"
        >
          Registrar Salida
        </Button>
      </div>

      {/* Lista de trabajadores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workers.map((worker) => {
          const workerAttendance = attendance.filter(record => record.user_id === worker.id);
          const entry = workerAttendance.find(r => r.type === 'entry');
          const exit = workerAttendance.find(r => r.type === 'exit');
          const status = entry ? (exit ? 'Completado' : 'En trabajo') : 'Ausente';

          return (
            <Card key={worker.id}>
              <CardHeader>
                <CardTitle className="text-xl">{worker.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">Cargo: {worker.role}</p>
                  <p className="text-sm">Estado: {status}</p>
                  {entry && (
                    <p className="text-sm">
                      Entrada: {new Date(entry.date).toLocaleTimeString()}
                    </p>
                  )}
                  {exit && (
                    <p className="text-sm">
                      Salida: {new Date(exit.date).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen del día */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Resumen del Día</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Presentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>En Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.working}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ausentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.absent}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}