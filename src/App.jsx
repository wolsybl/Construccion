import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { Dashboard } from "@/pages/dashboard";
import { TasksPage } from "@/pages/tasks";
import { InventoryPage } from "@/pages/inventory";
import { BudgetPage } from "@/pages/budget";
import { UsersPage } from "@/pages/users";
import { WorkerDashboard } from "@/pages/worker-dashboard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/pages/loading-screen";

const ROUTE_PERMISSIONS = {
  "1": ["/", "/tasks", "/inventory", "/budget", "/users"], //admin
  "3": ["/", "/tasks", "/inventory", "/budget"], //gerente
  "2": ["/", "/tasks"], // jefe de obra
  "4": ["/"] // trabajador
};

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return location.pathname !== "/login" ? <Navigate to="/login" /> : <LoginPage />;
  }

  if (profile?.role.toLowerCase() === "trabajador") {
    return <WorkerDashboard />;
  }

  const userRole = profile?.role.toLowerCase();
  const allowedRoutes = ROUTE_PERMISSIONS[userRole] || [];
  
  console.log("Rol del usuario:", profile?.role); // ← Verifica el rol
  console.log("Rutas permitidas:", ROUTE_PERMISSIONS[profile?.role.toLowerCase()]); // ← Verifica las rutas

  if (!allowedRoutes.includes(location.pathname)) {
    return <Navigate to={allowedRoutes[0] || "/"} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/budget" element={<BudgetPage />} />
      <Route path="/users" element={profile?.role.toLowerCase() === "admin" ? <UsersPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}