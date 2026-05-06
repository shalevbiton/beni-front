// frontend/src/App.jsx
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AuthPage from "./pages/AuthPage";
import EventSelectorPage from "./pages/EventSelectorPage";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center" dir="rtl">
      <span className="text-7xl font-black gradient-text">404</span>
      <p className="text-slate-400 text-lg">הדף לא נמצא.</p>
      <a href="/events" className="btn-primary mt-2">חזרה לאירועים</a>
    </div>
  );
}

export default function App() {
  const RequireAuth = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<MainLayout />}>
          <Route
            path="events"
            element={
              <RequireAuth>
                <EventsPage />
              </RequireAuth>
            }
          />
          <Route
            path="events/:id"
            element={
              <RequireAuth>
                <EventDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="schedule"
            element={
              <RequireAuth>
                <EventSelectorPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
