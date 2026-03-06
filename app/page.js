"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Leaf,
  Star,
  Heart,
  Sparkles,
  Map,
  CloudSun,
  MessageSquare,
  Award,
  Route,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Google OAuth icon
───────────────────────────────────────────────────────────── */
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 transition-all duration-300",
        scrolled
          ? "bg-stone-50/90 backdrop-blur-xl border-b border-green-900/10 shadow-sm"
          : "bg-transparent"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-green-800 flex items-center justify-center shadow-md">
          <Leaf className="w-4 h-4 text-green-100" />
        </div>
        <span
          className="text-green-950 text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          GatorGreen
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {["Explore", "Features", "How It Works"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm text-green-800/70 hover:text-green-900 px-3.5 py-2 rounded-lg hover:bg-green-900/5 transition-colors"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Auth buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-green-900 hover:text-green-950 hover:bg-green-900/8 font-medium text-sm"
          style={{ fontFamily: "var(--font-dm)" }}
        >
          Log In
        </Button>
        <Button
          className="bg-green-800 hover:bg-green-900 text-green-50 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ fontFamily: "var(--font-dm)" }}
        >
          Sign Up
        </Button>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-stone-50 px-6 pt-24 pb-20 text-center">

      {/* Soft background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-green-800/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full bg-green-700/6 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-stone-300/30 blur-3xl" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #14532d 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Status badge */}
        <Badge
          className="mb-6 gap-1.5 bg-green-800/10 text-green-800 border-green-800/20 hover:bg-green-800/10 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase animate-[fadeUp_0.6s_ease_both]"
          style={{ fontFamily: "var(--font-dm)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
          Now live in Gainesville, FL
        </Badge>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.0] text-green-950 mb-5 animate-[fadeUp_0.7s_0.08s_ease_both]"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Discover{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-green-700">green spaces</span>
            {/* Underline accent */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9 Q75 3 150 7 Q225 11 298 5"
                stroke="#4ade80"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </span>
          <br />
          near you.
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg text-green-900/55 max-w-[520px] leading-relaxed mb-10 animate-[fadeUp_0.7s_0.18s_ease_both]"
          style={{ fontFamily: "var(--font-dm)", fontWeight: 300 }}
        >
          GatorGreen maps every park, trail, and garden around you — with
          personalized recommendations, saved favorites, and real-time
          exploration built in.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 justify-center animate-[fadeUp_0.7s_0.28s_ease_both]">
          <Button
            size="lg"
            className="bg-green-800 hover:bg-green-900 text-green-50 gap-2.5 px-7 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            <GoogleIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            Continue with Google
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-green-800/25 text-green-800 hover:bg-green-800/6 hover:border-green-800/40 gap-2 px-7 py-6 text-base font-medium transition-all hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Explore the map
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex gap-10 flex-wrap justify-center animate-[fadeUp_0.7s_0.4s_ease_both]">
          {[
            { val: "120+", label: "Green Spaces" },
            { val: "4.9★", label: "Avg. Rating" },
            { val: "2,400+", label: "Explorers" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-3xl font-bold text-green-800"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                {val}
              </div>
              <div
                className="text-xs text-green-900/45 mt-1 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-dm)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <div className="w-px h-10 bg-green-800 animate-[fadeUp_1s_1s_ease_both]" />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Map Preview Section
───────────────────────────────────────────────────────────── */
function MapPreview() {
  return (
    <section id="features" className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

        {/* Map mockup */}
        <div className="relative rounded-3xl overflow-hidden border border-green-900/10 shadow-2xl shadow-green-900/10 aspect-[4/3] order-2 lg:order-1">
          {/* Map base */}
          <div
            className="absolute inset-0"
            style={{
              background: "#e8f0e9",
              backgroundImage:
                "linear-gradient(rgba(34,197,94,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.07) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* SVG roads + pins */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 300"
            fill="none"
          >
            <path d="M0 150 Q100 143 200 152 Q300 161 400 147" stroke="white" strokeWidth="10" opacity="0.65" />
            <path d="M196 0 Q191 80 194 150 Q197 222 196 300" stroke="white" strokeWidth="7" opacity="0.55" />
            <path d="M0 235 Q180 225 400 240" stroke="white" strokeWidth="5" opacity="0.45" />
            <path d="M68 0 Q63 100 70 300" stroke="white" strokeWidth="4" opacity="0.4" />

            {/* Park zone */}
            <rect x="84" y="60" width="126" height="92" rx="10" fill="rgba(21,128,61,0.14)" stroke="rgba(21,128,61,0.25)" strokeWidth="1.5" />
            <text x="147" y="109" textAnchor="middle" fill="#166534" fontSize="9" fontFamily="sans-serif" fontWeight="600" opacity="0.85">
              Depot Park
            </text>

            {/* Pins */}
            {[
              { cx: 147, cy: 96, color: "#15803d" },
              { cx: 264, cy: 141, color: "#166534" },
              { cx: 318, cy: 60,  color: "#15803d" },
              { cx: 94,  cy: 204, color: "#166534" },
            ].map(({ cx, cy, color }, i) => (
              <g key={i} transform={`translate(${cx},${cy})`}>
                <circle r="16" fill={color} opacity="0.1" />
                <circle r="9"  fill={color} opacity="0.9" />
                <circle r="3.5" fill="white" />
              </g>
            ))}
          </svg>

          {/* Map UI controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {["+", "−"].map((s) => (
              <div key={s} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-green-900/10 flex items-center justify-center text-green-800 text-sm font-semibold cursor-pointer hover:bg-green-50 transition-colors">
                {s}
              </div>
            ))}
          </div>

          {/* Bottom card */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 border border-green-900/8 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-green-100" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-950 leading-tight" style={{ fontFamily: "var(--font-bricolage)" }}>
                Depot Park
              </p>
              <p className="text-xs text-green-800/50 mt-0.5" style={{ fontFamily: "var(--font-dm)" }}>
                0.3 mi · Open now · ⭐ 4.8
              </p>
            </div>
            <Button size="sm" className="bg-green-800 hover:bg-green-900 text-white text-xs px-3 h-8 shrink-0">
              View
            </Button>
          </div>
        </div>

        {/* Text */}
        <div className="order-1 lg:order-2">
          <span
            className="text-xs font-bold text-green-600 tracking-[0.12em] uppercase block mb-3"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Interactive Map
          </span>
          <h2
            className="text-4xl lg:text-5xl font-extrabold text-green-950 leading-[1.08] tracking-tight mb-5"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Every trail & park —
            <br />
            <em className="not-italic text-green-700">at a glance.</em>
          </h2>
          <p
            className="text-base text-green-900/55 leading-relaxed max-w-[400px] mb-8"
            style={{ fontFamily: "var(--font-dm)", fontWeight: 300 }}
          >
            Powered by Leaflet. Filter by type, distance, or rating. Real-time
            data means you always see the freshest conditions.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { Icon: Map, title: "Filter by type", desc: "Parks, trails, gardens, dog-friendly & more" },
              { Icon: MapPin, title: "Your location", desc: "Instant proximity search from wherever you are" },
              { Icon: Star, title: "Community rated", desc: "Real reviews from Gainesville explorers" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start">
                <div className="w-10 h-10 rounded-xl bg-green-900/6 border border-green-900/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-green-700" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-green-950"
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-sm text-green-900/50 mt-0.5"
                    style={{ fontFamily: "var(--font-dm)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Features
───────────────────────────────────────────────────────────── */
const FEATURES = [
  { Icon: Heart,        title: "Save Favorites",      desc: "Bookmark spaces to build your personal green collection.", ring: "ring-green-700/15", icon: "text-green-700", bg: "bg-green-700/8" },
  { Icon: Sparkles,     title: "Smart Recs",           desc: "Personalized suggestions based on your history & vibe.",  ring: "ring-green-600/15", icon: "text-green-600", bg: "bg-green-600/8" },
  { Icon: Route,        title: "Trail Details",        desc: "Difficulty, distance, photos & reviews for every trail.", ring: "ring-green-800/15", icon: "text-green-800", bg: "bg-green-800/8" },
  { Icon: CloudSun,     title: "Live Conditions",      desc: "Weather overlays & crowd reports before you leave.",      ring: "ring-green-700/15", icon: "text-green-700", bg: "bg-green-700/8" },
  { Icon: MessageSquare,title: "Community Notes",      desc: "Leave tips, report closures, and share photos.",          ring: "ring-green-600/15", icon: "text-green-600", bg: "bg-green-600/8" },
  { Icon: Award,        title: "Explorer Badges",      desc: "Earn achievements as you hit discovery milestones.",      ring: "ring-green-800/15", icon: "text-green-800", bg: "bg-green-800/8" },
];

function Features() {
  return (
    <section className="bg-stone-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="text-xs font-bold text-green-600 tracking-[0.12em] uppercase block mb-3"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Everything you need
          </span>
          <h2
            className="text-4xl lg:text-5xl font-extrabold text-green-950 tracking-tight leading-[1.08]"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Built for every explorer.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc, ring, icon, bg }) => (
            <Card
              key={title}
              className={cn(
                "border border-green-900/8 bg-white shadow-none hover:shadow-xl hover:shadow-green-900/6 hover:-translate-y-1 transition-all duration-300 rounded-2xl ring-1",
                ring
              )}
            >
              <CardContent className="p-6">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", bg)}>
                  <Icon className={cn("w-5 h-5", icon)} />
                </div>
                <h3
                  className="text-base font-bold text-green-950 mb-1.5"
                  style={{ fontFamily: "var(--font-bricolage)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm text-green-900/50 leading-relaxed"
                  style={{ fontFamily: "var(--font-dm)" }}
                >
                  {desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   How It Works
───────────────────────────────────────────────────────────── */
const STEPS = [
  { num: "01", icon: <GoogleIcon className="w-6 h-6" />, title: "Sign in with Google", desc: "One click. No passwords, no friction — just your Google account." },
  { num: "02", icon: <MapPin className="w-6 h-6 text-green-700" />, title: "Share your location", desc: "We surface the best nearby parks, trails & gardens instantly." },
  { num: "03", icon: <Leaf className="w-6 h-6 text-green-700" />, title: "Explore & save", desc: "Browse the live map, read reviews, and save your favorites." },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span
          className="text-xs font-bold text-green-600 tracking-[0.12em] uppercase block mb-3"
          style={{ fontFamily: "var(--font-dm)" }}
        >
          Simple by design
        </span>
        <h2
          className="text-4xl lg:text-5xl font-extrabold text-green-950 tracking-tight leading-[1.08] mb-16"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          Up and exploring{" "}
          <em className="not-italic text-green-700">in under a minute.</em>
        </h2>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-green-200 via-green-400 to-green-200" />

          {STEPS.map(({ num, icon, title, desc }) => (
            <div key={num} className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-stone-50 border-2 border-green-800/20 flex flex-col items-center justify-center gap-0.5 shadow-sm">
                  <div>{icon}</div>
                  <span
                    className="text-[10px] font-bold text-green-700 tracking-wider"
                    style={{ fontFamily: "var(--font-bricolage)" }}
                  >
                    {num}
                  </span>
                </div>
              </div>
              <h3
                className="text-base font-bold text-green-950 mb-1.5"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                {title}
              </h3>
              <p
                className="text-sm text-green-900/50 leading-relaxed"
                style={{ fontFamily: "var(--font-dm)" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CTA Banner
───────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="bg-stone-50 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-green-900 rounded-3xl px-10 py-16 text-center overflow-hidden shadow-2xl shadow-green-900/30">
          {/* Background texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #86efac 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Soft glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-green-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-green-700/60 border border-green-600/30 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-7 h-7 text-green-200" />
            </div>
            <h2
              className="text-4xl lg:text-5xl font-extrabold text-green-50 tracking-tight leading-[1.08] mb-4"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Your next favorite
              <br />
              spot is waiting.
            </h2>
            <p
              className="text-base text-green-200/65 leading-relaxed max-w-md mx-auto mb-10"
              style={{ fontFamily: "var(--font-dm)", fontWeight: 300 }}
            >
              Join thousands of Gainesville explorers discovering hidden parks,
              peaceful trails, and vibrant community gardens.
            </p>
            <Button
              size="lg"
              className="bg-stone-50 hover:bg-white text-green-900 font-semibold gap-2.5 px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              <GoogleIcon className="w-[18px] h-[18px]" />
              Get started — it's free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-green-950 border-t border-green-900/40 px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center">
          <Leaf className="w-3.5 h-3.5 text-green-200" />
        </div>
        <span
          className="text-green-200 font-bold text-base"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          GatorGreen
        </span>
      </div>

      <p
        className="text-green-500/60 text-xs"
        style={{ fontFamily: "var(--font-dm)" }}
      >
        © {new Date().getFullYear()} GatorGreen · University of Florida
      </p>

      <div className="flex gap-5">
        {["Privacy", "Terms", "Contact"].map((link) => (
          <a
            key={link}
            href="#"
            className="text-xs text-green-400/50 hover:text-green-300 transition-colors"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   Global animations (injected via <style>)
───────────────────────────────────────────────────────────── */
const globalStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <style>{globalStyles}</style>
      <Navbar />
      <main>
        <Hero />
        <MapPreview />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}