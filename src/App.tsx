import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";

import ConfirmationPage from "./pages/public/ConfirmationPage";
import RegistrationPage from "./pages/public/RegistrationPage";

import DashboardPage from "./pages/admin/DashboardPage";
import ParticipantsPage from "./pages/admin/ParticipantsPage";
import MeetingsPage from "./pages/admin/MeetingsPage";
import ConfirmationsPage from "./pages/admin/ConfirmationsPage";
import AuthorizationsPage from "./pages/admin/AuthorizationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AdminScannerPage from "./pages/admin/AdminScannerPage";

import LoginPage from "./pages/public/LoginPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Navigate to="/confirmar" replace />} />
            <Route path="/confirmar" element={<ConfirmationPage />} />
            <Route path="/cadastro" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/leitor" element={<AdminScannerPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="participantes" element={<ParticipantsPage />} />
            <Route path="reunioes" element={<MeetingsPage />} />
            <Route path="confirmacoes" element={<ConfirmationsPage />} />
            <Route path="autorizacoes" element={<AuthorizationsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
