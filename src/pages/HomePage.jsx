// frontend/src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Booking",
    desc: "Reserve your spot in seconds with real-time availability checks.",
  },
  {
    icon: CalendarDays,
    title: "Event Discovery",
    desc: "Browse curated events across tech, arts, business, and more.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Your data is protected and bookings are guaranteed.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="text-center pt-12 pb-4 flex flex-col items-center gap-6 animate-slide-up">
        <span className="badge badge-blue text-xs tracking-widest uppercase">
          ✦ Next-Gen Booking Engine
        </span>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl">
          Discover & Book{" "}
          <span className="gradient-text">Unforgettable</span> Events
        </h1>

        <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
          From intimate workshops to large-scale conferences — EventSphere puts
          every experience one click away.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/events" id="hero-browse-btn" className="btn-primary text-base px-8 py-4">
            Browse Events
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/events" className="btn-ghost text-base px-8 py-4">
            Learn More
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="sr-only">Why EventSphere</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card flex flex-col gap-4 animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                <Icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
