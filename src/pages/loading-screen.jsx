// components/loading-screen.jsx
export const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-semibold">Cargando aplicación...</div>
      </div>
    </div>
  );