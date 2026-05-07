// frontend/src/pages/EventsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Loader2,
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  ArrowRight,
  Calendar,
  UserCheck,
  UserX,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { eventsApi, usersApi, registrationsApi } from "../services/api.service";
import CreateEventModal from "../components/events/CreateEventModal";

// --- CONSTANTS ---
const SLOTS = [
  { id: "session1", label: "מושב 1", description: "סשן מקצועי ראשון - פתיחת היום" },
  { id: "session2", label: "מושב 2", description: "סשן מקצועי שני - לפני הצהריים" },
  { id: "session3", label: "מושב 3", description: "סשן מקצועי שלישי - אחרי הצהריים" },
  { id: "session4", label: "מושב 4", description: "סשן מקצועי רביעי - סיום היום" },
];

// --- COMPONENTS ---

/** 
 * One-Click Registration Modal 
 */
function RegistrationModal({ isOpen, event, onClose, onRegistered }) {
  const [loading, setLoading] = useState(false);
  if (!isOpen || !event) return null;

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registrationsApi.register({ eventId: event.id });
      alert("נרשמת בהצלחה לאירוע!");
      onRegistered();
      onClose();
    } catch (err) {
      alert("שגיאה בהרשמה: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-[95%] max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto glass-card p-6 border-brand-500/30 text-center space-y-4">
        <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto border border-brand-500/30">
          <Calendar className="w-8 h-8 text-brand-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">{event.title}</h2>
          <p className="text-slate-400">{event.location} | {event.leadingTeam}</p>
        </div>
        <div className="py-4 border-y border-white/5 text-sm text-slate-300">
          האם ברצונך לאשר את הרשמתך לאירוע זה?
        </div>
        <div className="flex gap-4 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">ביטול</button>
          <button onClick={handleRegister} disabled={loading} className="flex-1 btn-primary py-3 rounded-xl font-black shadow-xl shadow-brand-500/20">{loading ? "מעבד..." : "אשר הרשמה"}</button>
        </div>
      </motion.div>
    </div>
  );
}

function EditEventModal({ editingEvent, setEditingEvent, handleUpdateEvent }) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingEvent) return;
    const start = editingEvent.startTime ? new Date(editingEvent.startTime) : null;
    const date = start ? start.toISOString().slice(0, 10) : "";
    const hh = start ? String(start.getHours()).padStart(2, "0") : "09";
    const mm = start ? String(start.getMinutes()).padStart(2, "0") : "00";
    const time = `${hh}:${mm}`;

    setForm({
      title: editingEvent.title || "",
      location: editingEvent.location || "",
      date,
      time,
      description: editingEvent.description || "",
    });
  }, [editingEvent]);

  if (!editingEvent) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const startDate = new Date(`${form.date}T${form.time}:00`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      await handleUpdateEvent({
        id: editingEvent.id,
        title: form.title.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      setEditingEvent(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[95%] max-w-md md:max-w-lg mx-auto max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6"
      >
        <h3 className="text-xl font-black text-white mb-4">עריכת אירוע</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="input-glass"
            placeholder="כותרת"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <input
            className="input-glass"
            placeholder="מיקום"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input-glass"
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
            <input
              className="input-glass"
              type="time"
              value={form.time}
              onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>
          <textarea
            className="input-glass min-h-[96px] resize-none"
            placeholder="תיאור"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingEvent(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors"
            >
              ביטול
            </button>
            <button type="submit" className="btn-primary px-6 py-2 text-sm font-black" disabled={saving}>
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/** 
 * Refined Event Card with Hover Actions 
 */
function EventCard({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onRegisterClick,
  onCancelRegistration,
  isRegisteredToEvent,
  isBlockedBySlot,
  index,
}) {
  const { id, title, location, leadingTeam } = event;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-4 hover:border-brand-500/40 transition-all group relative overflow-hidden shadow-xl"
    >
      {/* Admin Action Bar (Top Left) */}
      {isAdmin && (
        <div className="absolute top-2 left-2 flex gap-2 z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(event); }}
            className="p-2 bg-white/5 hover:bg-yellow-500/15 rounded-lg border border-white/10 text-white/60 hover:text-yellow-300 transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(id); }}
            className="p-2 bg-white/5 hover:bg-red-500/15 rounded-lg border border-white/10 text-white/60 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-4 text-right" dir="rtl">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-black text-white group-hover:text-brand-300 transition-colors leading-tight pl-16">{title}</h3>
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider flex-shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            זמין
          </span>
        </div>
        <div className="space-y-3 pt-2 border-t border-white/10 text-sm">
          <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-brand-400" /><span className="font-bold text-brand-200">{leadingTeam}</span></div>
          <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-brand-400" /><span className="text-slate-300">{location}</span></div>
        </div>
        {isBlockedBySlot && !isRegisteredToEvent && (
          <p className="mt-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            כבר שמרת מקום במושב זה, לא ניתן להירשם לעוד אירוע במושב
          </p>
        )}

        {isRegisteredToEvent ? (
          <button
            onClick={() => onCancelRegistration(event.id)}
            className="mt-3 py-2.5 rounded-xl font-black text-center transition-all bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-500/30"
          >
            ביטול הרשמה
          </button>
        ) : (
          <button
            onClick={() => onRegisterClick(event)}
            disabled={isBlockedBySlot}
            className={`mt-3 py-2.5 rounded-xl font-black text-center transition-all ${
              isBlockedBySlot
                ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
                : "btn-primary shadow-lg shadow-brand-500/20"
            }`}
          >
            להרשמה מהירה
          </button>
        )}
      </div>
    </motion.article>
  );
}

// --- MAIN PAGE ---

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const getViewFromQuery = () => {
    const qView = searchParams.get("view");
    return ["board", "stats", "approvals"].includes(qView) ? qView : "board";
  };
  const [currentView, setCurrentView] = useState(getViewFromQuery); // board | stats | approvals
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
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
    String(user?.role || "").toUpperCase() === "ADMIN" ||
    String(tokenRole || "").toUpperCase() === "ADMIN";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsResult, usersResult, statsResult] = await Promise.allSettled([
        eventsApi.getAll(),
        isAdmin ? usersApi.getAll() : Promise.resolve([]),
        registrationsApi.getMine(),
      ]);

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value || []);
      } else {
        console.error("Events fetch failed:", eventsResult.reason);
        setEvents([]);
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value || []);
      } else {
        console.error("Users fetch failed:", usersResult.reason);
        setUsers([]);
      }

      if (statsResult.status === "fulfilled") {
        const normalizedRegs = (statsResult.value || []).map((reg) => ({
          id: reg.id,
          eventId: reg.eventId ?? reg.event_id ?? reg.Event?.id ?? null,
          slot: reg.Event?.slot ?? null,
        }));
        setMyRegistrations(normalizedRegs);
      } else {
        console.error("Registrations fetch failed:", statsResult.reason);
        setMyRegistrations([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    setCurrentView(getViewFromQuery());
  }, [searchParams]);

  const stats = useMemo(() => {
    const totalReg = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
    const popularSession = [...SLOTS].sort((a, b) => {
      const countA = events.filter(e => e.slot === a.id).reduce((sum, e) => sum + (e.registeredCount || 0), 0);
      const countB = events.filter(e => e.slot === b.id).reduce((sum, e) => sum + (e.registeredCount || 0), 0);
      return countB - countA;
    })[0];
    return { totalReg, popularSession };
  }, [events]);
  const slotTotals = useMemo(() => {
    return SLOTS.map((slot) => ({
      ...slot,
      registrations: events
        .filter((e) => e.slot === slot.id)
        .reduce((sum, e) => sum + (e.registeredCount || 0), 0),
    }));
  }, [events]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק אירוע זה?")) return;
    try {
      await eventsApi.remove(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      alert(err.message);
    }
  };
  const handleUpdateEvent = async (updatedData) => {
    try {
      const { id, ...payload } = updatedData;
      const updatedEvent = await eventsApi.update(id, payload);
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, ...updatedEvent } : event))
      );
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };
  const handleUpdateUserStatus = async (userId, status) => {
    try { await usersApi.updateStatus(userId, status); fetchData(); } catch (err) { alert(err.message); }
  };
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`למחוק את המשתמש ${userName || ""}?`)) return;
    try {
      await usersApi.remove(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };
  const handleMakeAdmin = async (userId, userName) => {
    if (!window.confirm(`להפוך את ${userName || "המשתמש"} לאדמין?`)) return;
    try {
      await usersApi.updateRole(userId, "ADMIN");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: "ADMIN" } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  };
  const handleCancelRegistration = async (eventId) => {
    const reg = myRegistrations.find((r) => r.eventId === eventId);
    if (!reg) return;
    if (!window.confirm("לבטל את ההרשמה לאירוע זה?")) return;
    try {
      await registrationsApi.cancel(reg.id);
      setMyRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const eventById = new Map(events.map((e) => [e.id, e]));
  const registeredEventIds = new Set(myRegistrations.map((r) => r.eventId));
  const registeredSlots = new Set(
    myRegistrations
      .map((r) => r.slot || eventById.get(r.eventId)?.slot)
      .filter(Boolean)
  );

  const openRegModal = (event) => {
    const alreadyInSlot =
      !registeredEventIds.has(event.id) && registeredSlots.has(event.slot);
    if (alreadyInSlot) {
      alert("כבר שמרת מקום במושב זה. ניתן להירשם לאירוע אחד בכל מושב.");
      return;
    }
    setSelectedEvent(event);
    setIsRegModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-6 text-white" dir="rtl">
        <Loader2 className="w-12 h-12 text-brand-400 animate-spin" />
        <p className="text-xl font-bold animate-pulse">טוען...</p>
      </div>
    );
  }

  const eventStats = [...events]
    .map((event) => ({
      id: event.id,
      title: event.title,
      slot: event.slot,
      registrations: event.registeredCount || 0,
    }))
    .sort((a, b) => b.registrations - a.registrations);
  const maxEventRegistrations = Math.max(1, ...eventStats.map((event) => event.registrations));
  const pendingUsers = users.filter((u) => String(u.status || "").toUpperCase() === "PENDING");
  const approvedUsers = users.filter((u) => String(u.status || "").toUpperCase() === "APPROVED");

  return (
    <div
      className="min-h-screen pb-10 px-3 md:px-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
      dir="rtl"
    >
      <AnimatePresence mode="wait">
        {currentView === "board" && (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!activeSession ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SLOTS.map((slot) => {
                  const slotEvents = events.filter(e => e.slot === slot.id);
                  return (
                    <motion.div key={slot.id} layoutId={`session-${slot.id}`} onClick={() => setActiveSession(slot.id)} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer group hover:bg-white/[0.08] hover:border-brand-500/50 transition-all relative">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center"><Calendar className="w-6 h-6 text-brand-400" /></div>
                      <div><h2 className="text-2xl font-black text-white">{slot.label}</h2></div>
                      <div className="pt-4 flex justify-between items-center border-t border-white/5"><span className="text-xs font-bold text-brand-400">{slotEvents.length} אירועים</span><ArrowRight className="w-4 h-4 text-brand-400" /></div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div layoutId={`session-${activeSession}`} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-7 min-h-[60vh]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveSession(null)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-white"><ArrowRight className="rotate-180 w-4 h-4" /></button>
                    <div><h2 className="text-3xl font-black text-white">{SLOTS.find(s => s.id === activeSession)?.label}</h2><p className="text-brand-400 font-bold text-sm">{SLOTS.find(s => s.id === activeSession)?.description}</p></div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => { setSelectedSlot(activeSession); setIsEventModalOpen(true); }} className="btn-primary px-5 py-2.5 rounded-xl font-black shadow-xl shadow-brand-500/30 flex items-center gap-2"><Plus className="w-4 h-4" /> הוסף אירוע</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.filter(e => e.slot === activeSession).map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isAdmin={isAdmin}
                      onEdit={setEditingEvent}
                      onDelete={handleDeleteEvent}
                      onRegisterClick={openRegModal}
                      onCancelRegistration={handleCancelRegistration}
                      isRegisteredToEvent={registeredEventIds.has(event.id)}
                      isBlockedBySlot={
                        !registeredEventIds.has(event.id) &&
                        registeredSlots.has(event.slot)
                      }
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentView === "stats" && (
          <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-xl border border-emerald-400/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-300 text-sm font-semibold">סה״כ נרשמים</p>
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-3xl font-black text-white">{stats.totalReg}</p>
              </div>

              <div className="bg-gradient-to-br from-brand-500/10 to-indigo-500/5 backdrop-blur-xl border border-brand-400/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-300 text-sm font-semibold">המושב הפופולרי</p>
                  <BarChart3 className="w-5 h-5 text-brand-300" />
                </div>
                <p className="text-2xl font-black text-white">{stats.popularSession?.label || "—"}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 backdrop-blur-xl border border-indigo-400/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-300 text-sm font-semibold">משתמשים</p>
                  <Users className="w-5 h-5 text-indigo-300" />
                </div>
                <p className="text-3xl font-black text-white">{users.length}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-black text-white mb-4">חלוקת נתחי הרשמה לפי מושב (עוגות)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {slotTotals.map((slot) => {
                  const total = Math.max(1, stats.totalReg);
                  const share = slot.registrations / total;
                  const percent = Math.round(share * 100);
                  const radius = 44;
                  const circumference = 2 * Math.PI * radius;
                  const dash = circumference * share;
                  const rest = circumference - dash;

                  return (
                    <div key={slot.id} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center">
                      <div className="relative w-28 h-28 mb-3">
                        <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="12"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="url(#slotGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${rest}`}
                          />
                          <defs>
                            <linearGradient id="slotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-black text-white">{percent}%</span>
                        </div>
                      </div>
                      <p className="text-slate-100 font-bold">{slot.label}</p>
                      <p className="text-slate-400 text-xs mt-1">{slot.registrations} נרשמים</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-black text-white mb-4">הרשמות לפי אירוע</h3>
              <div className="space-y-3">
                {eventStats.map((event, idx) => {
                  const widthPercent = Math.round((event.registrations / maxEventRegistrations) * 100);
                  return (
                    <div key={event.id} className="bg-slate-900/30 border border-white/5 rounded-xl p-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-100 font-semibold">
                          {idx + 1}. {event.title}
                        </span>
                        <span className="text-brand-200 font-bold">{event.registrations}</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 via-indigo-400 to-cyan-300 rounded-full transition-all duration-700"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {currentView === "approvals" && (
          <motion.div key="approvals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <h3 className="text-lg font-black text-white">בקשות לאישור</h3>
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1">
                    {pendingUsers.length} ממתינים
                  </span>
                </div>
                <div className="w-full overflow-x-auto block overscroll-x-contain [webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[600px] text-right">
                    <thead><tr className="text-slate-400 text-sm border-b border-white/5"><th className="p-4 font-black whitespace-nowrap">שם</th><th className="p-4 font-black whitespace-nowrap">מספר אישי</th><th className="p-4 font-black whitespace-nowrap">סטטוס</th><th className="p-4 font-black whitespace-nowrap">תפקיד</th><th className="p-4 font-black whitespace-nowrap">פעולות</th></tr></thead>
                    <tbody>{pendingUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all"><td className="p-4 text-white font-bold whitespace-nowrap">{u.name}</td><td className="p-4 text-slate-300 whitespace-nowrap">{u.email || "—"}</td><td className="p-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400">PENDING</span>
                      </td><td className="p-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${String(u.role || "").toUpperCase() === "ADMIN" ? "bg-violet-500/20 text-violet-300" : "bg-slate-500/20 text-slate-300"}`}>
                          {String(u.role || "").toUpperCase() === "ADMIN" ? "ADMIN" : "USER"}
                        </span>
                      </td><td className="p-4 whitespace-nowrap">
                        <div className="flex gap-2 whitespace-nowrap">
                        {String(u.role || "").toUpperCase() !== "ADMIN" && (
                          <button onClick={() => handleMakeAdmin(u.id, u.name)} className="p-2 bg-violet-500/10 text-violet-300 rounded-lg hover:bg-violet-500/20 border border-violet-500/20">
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        <button onClick={() => handleUpdateUserStatus(u.id, 'APPROVED')} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20"><UserCheck size={18} /></button>
                        <button onClick={() => handleUpdateUserStatus(u.id, 'REJECTED')} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 border border-rose-500/20"><UserX size={18} /></button>
                        <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-2 bg-red-500/10 text-red-300 rounded-lg hover:bg-red-500/20 border border-red-500/20"><Trash2 size={18} /></button>
                        </div>
                      </td></tr>
                    ))}
                    {pendingUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 whitespace-nowrap">אין כרגע בקשות שממתינות לאישור</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <h3 className="text-lg font-black text-white">משתמשים מאושרים</h3>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">
                    {approvedUsers.length} מאושרים
                  </span>
                </div>
                <div className="w-full overflow-x-auto block overscroll-x-contain [webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[600px] text-right">
                    <thead><tr className="text-slate-400 text-sm border-b border-white/5"><th className="p-4 font-black whitespace-nowrap">שם</th><th className="p-4 font-black whitespace-nowrap">מספר אישי</th><th className="p-4 font-black whitespace-nowrap">סטטוס</th><th className="p-4 font-black whitespace-nowrap">תפקיד</th><th className="p-4 font-black whitespace-nowrap">פעולות</th></tr></thead>
                    <tbody>{approvedUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all"><td className="p-4 text-white font-bold whitespace-nowrap">{u.name}</td><td className="p-4 text-slate-300 whitespace-nowrap">{u.email || "—"}</td><td className="p-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400">APPROVED</span>
                      </td><td className="p-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${String(u.role || "").toUpperCase() === "ADMIN" ? "bg-violet-500/20 text-violet-300" : "bg-slate-500/20 text-slate-300"}`}>
                          {String(u.role || "").toUpperCase() === "ADMIN" ? "ADMIN" : "USER"}
                        </span>
                      </td><td className="p-4 whitespace-nowrap">
                        <div className="flex gap-2 whitespace-nowrap">
                        {String(u.role || "").toUpperCase() !== "ADMIN" && (
                          <button onClick={() => handleMakeAdmin(u.id, u.name)} className="p-2 bg-violet-500/10 text-violet-300 rounded-lg hover:bg-violet-500/20 border border-violet-500/20">
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        <button onClick={() => handleUpdateUserStatus(u.id, 'REJECTED')} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 border border-rose-500/20"><UserX size={18} /></button>
                        <button onClick={() => handleDeleteUser(u.id, u.name)} className="p-2 bg-red-500/10 text-red-300 rounded-lg hover:bg-red-500/20 border border-red-500/20"><Trash2 size={18} /></button>
                        </div>
                      </td></tr>
                    ))}
                    {approvedUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 whitespace-nowrap">אין משתמשים מאושרים כרגע</td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onEventCreated={(savedEvent) => {
          navigate("/events?view=board");
          fetchData();
          if (savedEvent?.slot) {
            setCurrentView("board");
            setActiveSession(savedEvent.slot);
          }
        }}
        initialSlot={selectedSlot}
        editEvent={null}
      />
      <EditEventModal
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        handleUpdateEvent={handleUpdateEvent}
      />
      <RegistrationModal isOpen={isRegModalOpen} event={selectedEvent} onClose={() => setIsRegModalOpen(false)} onRegistered={fetchData} />
    </div>
  );
}
