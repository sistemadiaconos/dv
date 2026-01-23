import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { Loading } from "./components/ui/loading";

// Lazy Load Public Pages
const ConfirmationPage = lazy(() => import("./pages/public/ConfirmationPage"));
const RegistrationPage = lazy(() => import("./pages/public/RegistrationPage"));
const LoginPage = lazy(() => import("./pages/public/LoginPage"));

// Lazy Load Admin Pages
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const ParticipantsPage = lazy(() => import("./pages/admin/ParticipantsPage"));
const MeetingsPage = lazy(() => import("./pages/admin/MeetingsPage"));
const ConfirmationsPage = lazy(() => import("./pages/admin/ConfirmationsPage"));
const AuthorizationsPage = lazy(() => import("./pages/admin/AuthorizationsPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const AdminScannerPage = lazy(() => import("./pages/admin/AdminScannerPage"));

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
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
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
