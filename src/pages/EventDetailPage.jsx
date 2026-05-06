// frontend/src/pages/EventDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarDays, MapPin, Users, ArrowLeft,
  Loader2, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { eventsApi, registrationsApi } from "../services/api.service";

const EMPTY_FORM = { name: "", email: "", phone: "" };

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Form state
  const [form, setForm]         = useState(EMPTY_FORM);
  const [submitting, setSubmit] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [formError, setFormErr] = useState(null);

  const loadEvent = () =>
    eventsApi
      .getById(id)
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { loadEvent(); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);
    setFormErr(null);
    try {
      await registrationsApi.register({ ...form, eventId: Number(id) });
      setSuccess(true);
      setForm(EMPTY_FORM);
      loadEvent(); // refresh spots count
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card max-w-md mx-auto text-center py-12 flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <h1 className="text-xl font-semibold text-rose-300">Error</h1>
        <p className="text-slate-400 text-sm">{error}</p>
        <Link to="/events" className="btn-ghost">← Back to Events</Link>
      </div>
    );
  }

  const isFull = event.spotsLeft <= 0;
  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Back */}
      <Link to="/events" className="btn-ghost self-start">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Event Info ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 glass-card flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold gradient-text">{event.title}</h1>
            <span className={`badge flex-shrink-0 ${isFull ? "badge-red" : "badge-green"}`}>
              {isFull ? "Sold Out" : `${event.spotsLeft} spots left`}
            </span>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-brand-400" /> {dateStr}
            </span>
            <span className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-brand-400" /> {event.location}
            </span>
            <span className="flex items-center gap-3">
              <Users className="w-4 h-4 text-brand-400" />
              {event.registeredCount} / {event.capacity} registered
            </span>
          </div>

          {event.description && (
            <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
          )}

          {/* Capacity bar */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Capacity</span>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700"
                style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Registration Form ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 glass-card flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-slate-100">Register</h2>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <p className="font-semibold text-emerald-300">You're registered!</p>
              <p className="text-slate-400 text-sm">See you at the event. 🎉</p>
              <button
                onClick={() => setSuccess(false)}
                className="btn-ghost mt-2 text-xs"
              >
                Register another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {formError && (
                <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {formError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-name" className="text-xs text-slate-400 font-medium">
                  Full Name *
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="input-glass"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="text-xs text-slate-400 font-medium">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="input-glass"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-phone" className="text-xs text-slate-400 font-medium">
                  Phone <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="input-glass"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                className="btn-primary mt-2 w-full justify-center"
                disabled={submitting || isFull}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
                ) : isFull ? (
                  "Event Full"
                ) : (
                  "Confirm Registration"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
