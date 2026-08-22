import { lazy, Suspense, type ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ArrowLeft, FileQuestion, Loader2, Sparkles } from "lucide-react";

import ProtectedRoute from "./ProtectedRoute";
import { getAccessToken } from "../services/authService";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const DocumentsPage = lazy(() => import("../pages/documents/DocumentsPage"));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const HistoryPage = lazy(() => import("../pages/history/HistoryPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

interface AppRoute { path: string; element: ReactNode; }

const publicRoutes: AppRoute[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

const protectedRoutes: AppRoute[] = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/documents", element: <DocumentsPage /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/history", element: <HistoryPage /> },
  { path: "/profile", element: <ProfilePage /> },
];

function PageLoader() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles size={22} /></div>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold"><Loader2 size={16} className="animate-spin text-primary" />Loading workspace</div>
        <p className="mt-1 text-xs text-muted-foreground">Preparing your page...</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileQuestion size={26} /></div>
        <p className="mt-5 font-display text-6xl font-semibold tracking-tight text-foreground">404</p>
        <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/dashboard" className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"><ArrowLeft size={16} />Back to dashboard</Link>
      </div>
    </div>
  );
}

function RootRedirect() {
  return <Navigate replace to={getAccessToken() ? "/dashboard" : "/login"} />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        {publicRoutes.map((route) => <Route key={route.path} path={route.path} element={route.element} />)}
        <Route element={<ProtectedRoute />}>
          {protectedRoutes.map((route) => <Route key={route.path} path={route.path} element={route.element} />)}
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
