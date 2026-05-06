// frontend/src/components/layout/MainLayout.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus } from "lucide-react";
import { useState } from "react";
import CreateEventModal from "../events/CreateEventModal";
import topRightBadge from "../../assets/top-right-badge.png";

export default function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  let tokenRole = "";
  if (token && token.includes(".")) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      tokenRole = payload?.role || "";
    } catch {
      tokenRole = "";
    }
  }

  const isAdmin =
    String(storedUser?.role || "").toUpperCase() === "ADMIN" ||
    String(tokenRole || "").toUpperCase() === "ADMIN";

  const currentView = new URLSearchParams(location.search).get("view") || "board";

  // This function can be passed to children or handled here to refresh the UI
  const handleEventCreated = () => {
    navigate("/events?view=board");
  };

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-14 py-2 flex items-center justify-between gap-4">
          <div className="select-none flex items-center gap-2 shrink-0">
            <img
              src={topRightBadge}
              alt="סמל סדנא אסטרטגית"
              className="h-10 w-10 md:h-11 md:w-11 object-contain pointer-events-none"
            />
            <span className="text-sm md:text-base font-black tracking-wide bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent drop-shadow-sm whitespace-nowrap">
              סדנא אסטרטגית
            </span>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap overflow-x-auto overflow-y-hidden">
            <button
              onClick={() => navigate("/events?view=board")}
              className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors ${
                currentView === "board" ? "bg-white/20 border-white/30" : ""
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                בית
              </span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary flex items-center gap-2 px-3 py-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוספת אירוע</span>
                </button>
                <button
                  onClick={() => navigate("/events?view=stats")}
                  className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors ${
                    currentView === "stats" ? "bg-white/20 border-white/30" : ""
                  }`}
                >
                  סטטיסטיקות
                </button>
                <button
                  onClick={() => navigate("/events?view=approvals")}
                  className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors ${
                    currentView === "approvals" ? "bg-white/20 border-white/30" : ""
                  }`}
                >
                  אישורים
                </button>
              </>
            )}
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
              className="text-slate-400 hover:text-rose-400 text-sm font-medium transition-colors"
            >
              התנתקות
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="glass border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()}{" "}
            <span className="gradient-text font-semibold">מערכת אירועים</span>.
            כל הזכויות שמורות.
          </p>
          <p className="text-xs text-slate-600">
            נבנה עם React · Express · Supabase
          </p>
        </div>
      </footer>

      {/* Modal */}
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
