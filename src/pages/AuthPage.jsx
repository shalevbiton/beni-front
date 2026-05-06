import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, stringifyApiError } from "../services/api.service";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", personalNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "register") {
        const response = await authApi.register({
          name: form.name.trim(),
          personalNumber: form.personalNumber.trim(),
          password: form.password,
        });
        setMessage(
          response.message ||
            "הבקשה נשלחה בהצלחה. ממתין לאישור מנהל."
        );
      } else {
        const response = await authApi.login({
          personalNumber: form.personalNumber.trim(),
          password: form.password,
        });
        localStorage.setItem("token", response.token);
        setMessage("ההתחברות בוצעה בהצלחה.");
        navigate("/events");
      }
    } catch (err) {
      setError(stringifyApiError(err, "אירעה שגיאה בהתחברות"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold gradient-text">סנדא אסטרטגית</h1>
          <img
            src={`${import.meta.env.BASE_URL}strategic-emblem.png`}
            alt="סמל סנדא אסטרטגית"
            className="mx-auto mt-4 h-36 w-auto max-w-[min(250px,100%)] object-contain drop-shadow-md select-none"
            draggable={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "login"
                ? "bg-brand-500/30 text-white border border-brand-400/40"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            התחברות
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "register"
                ? "bg-brand-500/30 text-white border border-brand-400/40"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            בקשת גישה
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="input-glass"
              type="text"
              placeholder="שם מלא"
              required
            />
          )}

          <input
            name="personalNumber"
            value={form.personalNumber}
            onChange={onChange}
            className="input-glass"
            type="text"
            placeholder="מספר אישי"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={onChange}
            className="input-glass"
            type="password"
            placeholder="סיסמה"
            minLength={8}
            required
          />

          {message && (
            <p className="text-sm rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 px-3 py-2">
              {message}
            </p>
          )}

          {error && (
            <p className="text-sm rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading
              ? "טוען..."
              : mode === "login"
              ? "התחברות"
              : "שליחת בקשת גישה"}
          </button>
        </form>
      </div>
    </div>
  );
}
