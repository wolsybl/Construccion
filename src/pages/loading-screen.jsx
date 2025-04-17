// components/loading-screen.jsx
import React, { useEffect } from 'react';
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  useEffect(() => {
    // Temporizador para recargar después de 10 segundos
    const timeout = setTimeout(() => {
      console.log("Recargando página por timeout en loading...");
      window.location.reload();
    }, 10000); // 10 segundos

    // Cleanup del temporizador
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-medium">Cargando...</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Si la carga demora demasiado, la página se recargará automáticamente
        </p>
      </div>
    </div>
  );
}