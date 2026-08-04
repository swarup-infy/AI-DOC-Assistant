import {
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import { getAccessToken } from "../services/authService";

//
// Lazy Pages
//

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const DocumentsPage = lazy(() => import("../pages/documents/DocumentsPage"));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const HistoryPage = lazy(() => import("../pages/history/HistoryPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

//
// Route Configuration
//

interface AppRoute {
  path: string;
  element: ReactNode;
}

const publicRoutes: AppRoute[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
];

const protectedRoutes: AppRoute[] = [
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/documents",
    element: <DocumentsPage />,
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/history",
    element: <HistoryPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
];

//
// Loader
//

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />

        <div className="space-y-1 text-center">
          <h2 className="font-semibold">Loading</h2>

          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your page...
          </p>
        </div>
      </div>
    </div>
  );
}

//
// Not Found
//

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>

        <h2 className="mt-4 text-2xl font-semibold">
          Page Not Found
        </h2>

        <p className="mt-3 text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

//
// Root Redirect
//

function RootRedirect() {
  const authenticated = !!getAccessToken();

  return (
    <Navigate
      replace
      to={authenticated ? "/dashboard" : "/login"}
    />
  );
}

//
// Router
//

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={<RootRedirect />}
        />

        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        <Route element={<ProtectedRoute />}>
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
}