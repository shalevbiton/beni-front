import { useState, useEffect } from "react";
import { X, MapPin, Type, LayoutGrid, Users, Save } from "lucide-react";
import { eventsApi } from "../../services/api.service";

export default function CreateEventModal({ isOpen, onClose, onEventCreated, initialSlot = "", editEvent = null }) {
  const [form, setForm] = useState({ title: "", location: "", slot: "", leadingTeam: "" });
  const [loading, setLoading] = useState(false);

  const slotLabels = { 
    session1: "מושב 1", 
    session2: "מושב 2", 
    session3: "מושב 3", 
    session4: "מושב 4" 
  };
  
  const teamOptions = [
    "צוות אנשים", 
    "צוות טכנולגיה", 
    "צוות מקצוע", 
    "צוות מודיעין", 
    "צוות תקשורת ותודעה", 
    "צוות מצ\"ח 2035"
  ];

  const locationOptions = [
    "כיתה 1",
    "כיתה 2",
    "כיתה 3",
    "כיתה 4",
    "כיתה 5",
    "כיתה 6",
  ];

  // Auto-fill when opened or when editEvent changes
  useEffect(() => {
    if (editEvent) {
      setForm({
        title: editEvent.title || "",
        location: editEvent.location || "",
        slot: editEvent.slot || "",
        leadingTeam: editEvent.leadingTeam || ""
      });
    } else if (initialSlot) {
      setForm(prev => ({ ...prev, slot: initialSlot }));
    } else {
      setForm({ title: "", location: "", slot: "", leadingTeam: "" });
    }
  }, [initialSlot, editEvent, isOpen]);

  if (!isOpen) return null;

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getDummyTimestamp = (hour) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        title: form.title,
        location: form.location,
        slot: form.slot,
        leadingTeam: form.leadingTeam,
        startTime: editEvent?.startTime || getDummyTimestamp(8),
        endTime: editEvent?.endTime || getDummyTimestamp(9),
        description: editEvent?.description || "",
        capacity: editEvent?.capacity || 10
      };

      setLoading(true);

      let savedEvent = null;
      if (editEvent) {
        // UPDATE Existing Event
        savedEvent = await eventsApi.update(editEvent.id, payload);
        alert("האירוע עודכן בהצלחה!");
      } else {
        // CREATE New Event
        savedEvent = await eventsApi.create(payload);
        alert("האירוע נשמר בהצלחה!");
      }

      onEventCreated(savedEvent);
      onClose();
      setForm({ title: "", location: "", slot: "", leadingTeam: "" });
      
    } catch (err) {
      const errorData = err.response?.data?.error || err.message || JSON.stringify(err);
      alert("שגיאה בפעולה: " + errorData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold gradient-text">
            {editEvent ? "עריכת אירוע" : "הוספה מהירה לאירוע"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-brand-400" /> כותרת האירוע
            </label>
            <input name="title" value={form.title} onChange={onChange} required placeholder="שם האירוע" className="input-glass w-full py-3.5" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" /> מיקום
            </label>
            <select
              name="location"
              value={form.location}
              onChange={onChange}
              required
              className="input-glass w-full py-3.5 bg-slate-900"
            >
              <option value="" disabled>בחר כיתה...</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" /> צוות מוביל
            </label>
            <select name="leadingTeam" value={form.leadingTeam} onChange={onChange} required className="input-glass w-full py-3.5 bg-slate-900">
              <option value="" disabled>בחר צוות...</option>
              {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-brand-400" /> בחר מושב (Session)
            </label>
            <select name="slot" value={form.slot} onChange={onChange} required className="input-glass w-full py-3.5 bg-slate-900">
              <option value="" disabled>בחר מושב...</option>
              {Object.entries(slotLabels).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xl font-black shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {loading ? "שומר..." : editEvent ? "עדכן אירוע" : "שמירת אירוע"}
          </button>
        </form>
      </div>
    </div>
  );
}
