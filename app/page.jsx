"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MapPin, Leaf, Star, Heart, Sparkles, Map,
  CloudSun, MessageSquare, Award, Route, ArrowRight,
} from "lucide-react";

/* ── Color tokens ─────────────────────────────────────────── */
const GOLD       = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const GOLD_PALE  = "rgba(201,168,76,0.10)";
const GOLD_RING  = "rgba(201,168,76,0.22)";

/* ── Shiny green gradient tokens ─────────────────────────── */
const G = {
  // deep forest — nav logo, primary buttons
  deep:   "linear-gradient(135deg, #0c3320 0%, #14532d 30%, #1a6b3c 55%, #22854a 75%, #0f3d24 100%)",
  // mid forest — map pins, icon chips
  mid:    "linear-gradient(135deg, #14532d 0%, #166534 35%, #1f8c4a 60%, #15803d 80%, #0d3d20 100%)",
  // bright — hover states
  bright: "linear-gradient(135deg, #15803d 0%, #1da54e 40%, #22c55e 65%, #15803d 100%)",
  // panel — CTA dark panel
  panel:  "linear-gradient(150deg, #040f08 0%, #0a2b18 25%, #0d3d22 55%, #072414 80%, #040f08 100%)",
  // footer
  footer: "linear-gradient(160deg, #020a05 0%, #071a0e 40%, #0a2318 70%, #030d07 100%)",
};

/* ── Gradient text helpers ───────────────────────────────── */
const GT = {
  // main heading gradient — dark forest to bright mid green
  heading: "linear-gradient(135deg, #0a2e18 0%, #166534 35%, #22c55e 65%, #15803d 100%)",
  // subheading — slightly lighter
  sub:     "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)",
  // on dark backgrounds (CTA panel)
  light:   "linear-gradient(135deg, #86efac 0%, #4ade80 40%, #d1fae5 70%, #86efac 100%)",
  // accent italic/em spans
  accent:  "linear-gradient(135deg, #166534 0%, #22c55e 60%, #4ade80 100%)",
};

// inline style shorthand for gradient text
const gText = (grad) => ({
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
});
const globalStyles = `
  /* ── Scroll-reveal states ── */
  .reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal.reveal-left {
    transform: translateX(-48px);
  }
  .reveal.reveal-right {
    transform: translateX(48px);
  }
  .reveal.reveal-scale {
    transform: scale(0.92) translateY(24px);
  }
  .reveal.is-visible {
    opacity: 1 !important;
    transform: none !important;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatA {
    0%,100% { transform: translateY(0px)   rotate(0deg);  }
    50%      { transform: translateY(-16px) rotate(4deg);  }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0px)  rotate(0deg);   }
    50%      { transform: translateY(-10px) rotate(-3deg); }
  }
  @keyframes floatC {
    0%,100% { transform: translateY(0px)   rotate(0deg);  }
    50%      { transform: translateY(-20px) rotate(6deg);  }
  }
  @keyframes spinSlow         { to { transform: rotate(360deg);  } }
  @keyframes spinSlowReverse  { to { transform: rotate(-360deg); } }
  @keyframes goldPulse {
    0%,100% { opacity: 0.30; }
    50%      { opacity: 0.70; }
  }
  @keyframes drift {
    0%   { transform: translate(0,0)      scale(1);    opacity: 0.6;  }
    33%  { transform: translate(9px,-14px) scale(1.15); opacity: 0.85; }
    66%  { transform: translate(-7px,6px)  scale(0.9);  opacity: 0.5;  }
    100% { transform: translate(0,0)      scale(1);    opacity: 0.6;  }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 900; }
    to   { stroke-dashoffset: 0;   }
  }
  @keyframes bob {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(8px); }
  }
  @keyframes arcExpand {
    from { stroke-dashoffset: 600; opacity: 0; }
    to   { stroke-dashoffset: 0;   opacity: 1; }
  }
  @keyframes breathe {
    0%,100% { transform: scale(1);    opacity: 0.5; }
    50%      { transform: scale(1.08); opacity: 0.8; }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes shineSwipe {
    0%   { transform: translateX(-120%) skewX(-20deg); }
    100% { transform: translateX(350%)  skewX(-20deg); }
  }
  .shiny-btn { position: relative; overflow: hidden; }
  .shiny-btn::after {
    content: '';
    position: absolute;
    top: -20%; left: 0;
    width: 35%; height: 140%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
    animation: shineSwipe 3.5s 1s ease-in-out infinite;
    pointer-events: none;
  }
  .feature-card:hover {
    transform: translateY(-5px) !important;
    box-shadow: 0 20px 50px rgba(20,83,45,0.1) !important;
    border-color: rgba(201,168,76,0.35) !important;
  }
`;

/* ─────────────────────────────────────────────────────────────
   Scroll-reveal wrapper
   dir: "up" | "left" | "right" | "scale"
   delay: CSS delay string e.g. "0.1s"
───────────────────────────────────────────────────────────── */
function Reveal({ children, dir = "up", delay = "0s", className = "", style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dirClass = dir === "left" ? "reveal-left"
    : dir === "right" ? "reveal-right"
    : dir === "scale" ? "reveal-scale"
    : "";

  return (
    <div
      ref={ref}
      className={cn("reveal", dirClass, visible && "is-visible", className)}
      style={{ transitionDelay: visible ? delay : "0s", ...style }}
    >
      {children}
    </div>
  );
}

/* ── Reusable primitives ──────────────────────────────────── */

function LeafSVG({ size = 80, color = "#166534", opacity = 0.18, style = {} }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 80 120" fill="none"
      style={{ pointerEvents: "none", ...style }}>
      <path d="M40 115 C40 115 5 80 5 48 C5 22 22 5 40 5 C58 5 75 22 75 48 C75 80 40 115 40 115Z"
        fill={color} opacity={opacity} />
      <path d="M40 115 L40 5"            stroke={color} strokeWidth="1.2" opacity={opacity * 1.6} />
      <path d="M40 70  C40 70  18 55 12 36" stroke={color} strokeWidth="0.8" opacity={opacity * 1.3} />
      <path d="M40 85  C40 85  62 70 68 50" stroke={color} strokeWidth="0.8" opacity={opacity * 1.3} />
      <path d="M40 52  C40 52  20 40 15 24" stroke={color} strokeWidth="0.7" opacity={opacity} />
      <path d="M40 52  C40 52  60 40 65 24" stroke={color} strokeWidth="0.7" opacity={opacity} />
    </svg>
  );
}

function GoldDot({ size = 5, style = {}, delay = "0s" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: GOLD, boxShadow: `0 0 ${size * 3}px ${GOLD}88`,
      animation: `drift ${3 + size * 0.4}s ${delay} ease-in-out infinite`,
      pointerEvents: "none", position: "absolute", ...style,
    }} />
  );
}

/* Large botanical corner cluster — vine of leaves spreading from a corner */
function VineCluster({ corner = "tl", color = "#166534", goldAccent = false }) {
  const isRight = corner.includes("r");
  const isBottom = corner.includes("b");
  const flip  = isRight  ? "scaleX(-1)" : "";
  const flipY = isBottom ? "scaleY(-1)" : "";
  return (
    <div style={{
      position: "absolute",
      top:    isBottom ? "auto" : 0,
      bottom: isBottom ? 0 : "auto",
      left:   isRight  ? "auto" : 0,
      right:  isRight  ? 0 : "auto",
      width: 280, height: 320,
      transform: `${flip} ${flipY}`,
      pointerEvents: "none", overflow: "hidden",
    }}>
      <svg width="280" height="320" viewBox="0 0 280 320" fill="none"
        style={{ position: "absolute", inset: 0 }}>
        {/* Main curling vine */}
        <path d="M10 310 Q40 240 80 200 Q130 155 100 100 Q70 55 120 20"
          stroke={color} strokeWidth="1.5" opacity="0.18" fill="none"
          strokeDasharray="500" style={{ animation: "drawLine 2.5s 0.3s ease forwards" }} />
        {/* Branch 1 */}
        <path d="M65 215 Q90 195 105 175"
          stroke={color} strokeWidth="1" opacity="0.14" fill="none"
          strokeDasharray="100" style={{ animation: "drawLine 1.5s 0.8s ease forwards" }} />
        {/* Branch 2 */}
        <path d="M88 175 Q120 158 128 138"
          stroke={color} strokeWidth="1" opacity="0.12" fill="none"
          strokeDasharray="100" style={{ animation: "drawLine 1.5s 1.2s ease forwards" }} />
        {/* Branch 3 */}
        <path d="M100 138 Q118 110 112 88"
          stroke={color} strokeWidth="0.8" opacity="0.10" fill="none"
          strokeDasharray="80" style={{ animation: "drawLine 1.2s 1.5s ease forwards" }} />

        {/* Gold accent curlicue */}
        {goldAccent && (
          <path d="M50 260 Q70 245 65 228 Q60 215 75 205"
            stroke={GOLD} strokeWidth="0.8" opacity="0.25" fill="none"
            strokeDasharray="80" style={{ animation: "drawLine 1.8s 1s ease forwards" }} />
        )}
      </svg>

      {/* Leaves along the vine */}
      <div style={{ position:"absolute", top: 80, left: 55,
        animation: "floatA 8s ease-in-out infinite" }}>
        <LeafSVG size={50} color={color} opacity={0.14} style={{ transform:"rotate(-40deg)" }} />
      </div>
      <div style={{ position:"absolute", top: 120, left: 70,
        animation: "floatB 10s 1s ease-in-out infinite" }}>
        <LeafSVG size={38} color={color} opacity={0.10} style={{ transform:"rotate(-15deg)" }} />
      </div>
      <div style={{ position:"absolute", top: 30, left: 80,
        animation: "floatC 7s 0.5s ease-in-out infinite" }}>
        <LeafSVG size={44} color={color} opacity={0.12} style={{ transform:"rotate(-60deg)" }} />
      </div>
      <div style={{ position:"absolute", top: 160, left: 40,
        animation: "floatA 9s 2s ease-in-out infinite" }}>
        <LeafSVG size={32} color={color} opacity={0.09} style={{ transform:"rotate(-25deg)" }} />
      </div>

      {/* Small gold dot on vine */}
      {goldAccent && (
        <GoldDot size={4} style={{ top: 205, left: 62 }} delay="0.5s" />
      )}
    </div>
  );
}

/* Animated concentric arc burst (for hero center-background) */
function ArcBurst({ size = 700 }) {
  const arcs = [340, 290, 240, 190, 140, 90];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none"
      style={{ position:"absolute", pointerEvents:"none",
        top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:0 }}>
      {arcs.map((r, i) => (
        <circle key={r} cx={size/2} cy={size/2} r={r}
          stroke={i % 2 === 0 ? GOLD : "#166534"}
          strokeWidth={i === 0 ? 0.7 : 0.5}
          opacity={0.07 - i * 0.008}
          strokeDasharray={i % 2 === 0 ? "6 5" : "3 9"}
          style={{
            animation: `spinSlow ${60 + i * 15}s ${i % 2 === 0 ? "" : "reverse"} linear infinite`,
            transformOrigin: `${size/2}px ${size/2}px`,
          }}
        />
      ))}
      {/* Gold accent dots on outer ring */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx  = size/2 + 340 * Math.cos(rad);
        const cy  = size/2 + 340 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="2.5" fill={GOLD} opacity="0.25" />;
      })}
    </svg>
  );
}

/* Sweeping gold lines that animate across the hero */
function GoldSweepLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.22 }}>
      {/* Long sweeping curved gold line across mid-section */}
      <path d="M-60 420 Q 250 320 550 390 Q 850 455 1120 345"
        stroke={GOLD} strokeWidth="1" fill="none"
        strokeDasharray="900"
        style={{ animation: "drawLine 2.8s 0.8s ease forwards", strokeDashoffset: 900 }} />
      <path d="M-60 460 Q 300 355 600 430 Q 870 495 1150 385"
        stroke={GOLD} strokeWidth="0.6" fill="none" opacity="0.55"
        strokeDasharray="900"
        style={{ animation: "drawLine 3.2s 1.2s ease forwards", strokeDashoffset: 900 }} />
      {/* Short diagonal accent top-right */}
      <path d="M 820 40 Q 950 120 980 220"
        stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.5"
        strokeDasharray="300"
        style={{ animation: "drawLine 1.6s 1.8s ease forwards", strokeDashoffset: 300 }} />
      {/* Short accent bottom-left */}
      <path d="M 80 680 Q 140 620 230 590"
        stroke={GOLD} strokeWidth="0.7" fill="none" opacity="0.4"
        strokeDasharray="200"
        style={{ animation: "drawLine 1.5s 2.2s ease forwards", strokeDashoffset: 200 }} />
    </svg>
  );
}

/* Botanical hex grid tile - sparse decorative hex pattern */
function HexGrid({ opacity = 0.03, color = "#14532d" }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="hex" width="56" height="48" patternUnits="userSpaceOnUse">
          <polygon points="14,2 42,2 56,24 42,46 14,46 0,24"
            stroke={color} strokeWidth="0.7" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

/* Google Icon ──────────────────────────────────────────────── */
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

/* ── Navbar ───────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 transition-all duration-300",
      scrolled
        ? "bg-stone-50/92 backdrop-blur-xl border-b border-green-900/10 shadow-sm"
        : "bg-transparent"
    )}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: G.deep, boxShadow: "0 2px 14px rgba(20,83,45,0.5), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
          <Leaf className="w-4 h-4 text-green-100" />
        </div>
        <span className="text-green-950 text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-bricolage)" }}>GatorGreen</span>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {["Explore","Features","How It Works"].map(item => (
          <a key={item} href="#"
            className="text-sm text-green-800/65 hover:text-green-900 px-3.5 py-2 rounded-lg hover:bg-green-900/5 transition-colors"
            style={{ fontFamily:"var(--font-dm)" }}>{item}</a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost"
          className="font-medium text-sm"
          style={{
            fontFamily:"var(--font-dm)",
            color: "#78350f",
            background: `linear-gradient(110deg, #f5f0e8 0%, ${GOLD_LIGHT} 50%, #f5f0e8 100%)`,
            boxShadow: `0 2px 10px ${GOLD}44`,
          }}>
          Log In
        </Button>
        <Button className="shiny-btn text-green-50 text-sm font-semibold"
          style={{ background: G.deep, fontFamily:"var(--font-dm)",
            boxShadow:"0 2px 14px rgba(20,83,45,0.45), inset 0 1px 0 rgba(255,255,255,0.12)" }}
          onMouseEnter={e => { e.currentTarget.style.background = G.mid; e.currentTarget.style.boxShadow = "0 4px 20px rgba(20,83,45,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = G.deep; e.currentTarget.style.boxShadow = "0 2px 14px rgba(20,83,45,0.45), inset 0 1px 0 rgba(255,255,255,0.12)"; }}>
          Sign Up
        </Button>
      </div>
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-stone-50 px-6 pt-24 pb-20 text-center">

      {/* ── BG Layer 1: soft gradient washes ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full blur-3xl"
          style={{ background:"radial-gradient(ellipse, rgba(20,83,45,0.07) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[700px] h-[500px] blur-3xl"
          style={{ background:"radial-gradient(ellipse, rgba(34,197,94,0.045) 0%, transparent 70%)" }} />
        <div className="absolute top-[20%] right-0 w-[550px] h-[550px] blur-3xl"
          style={{ background:`radial-gradient(ellipse, ${GOLD_PALE} 0%, transparent 65%)` }} />
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] blur-3xl"
          style={{ background:"radial-gradient(ellipse, rgba(20,83,45,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* ── BG Layer 2: hex grid ── */}
      <HexGrid opacity={0.028} />

      {/* ── BG Layer 3: gold sweep lines ── */}
      <GoldSweepLines />

      {/* ── BG Layer 4: concentric arc burst (centered, behind content) ── */}
      <ArcBurst size={760} />

      {/* ── BG Layer 5: vine clusters in all 4 corners ── */}
      <VineCluster corner="tl" color="#166534" goldAccent />
      <VineCluster corner="tr" color="#14532d" goldAccent />
      <VineCluster corner="bl" color="#15803d" />
      <VineCluster corner="br" color="#166534" goldAccent />

      {/* ── BG Layer 6: extra floating solo leaves (mid-section) ── */}
      <div className="absolute top-[38%] left-[6%] pointer-events-none"
        style={{ animation:"floatB 11s 1s ease-in-out infinite" }}>
        <LeafSVG size={52} color="#14532d" opacity={0.09} style={{ transform:"rotate(-10deg)" }} />
      </div>
      <div className="absolute top-[44%] right-[7%] pointer-events-none"
        style={{ animation:"floatA 9s 2.5s ease-in-out infinite" }}>
        <LeafSVG size={46} color="#15803d" opacity={0.08} style={{ transform:"scaleX(-1) rotate(15deg)" }} />
      </div>

      {/* ── BG Layer 7: gold dust particles ── */}
      <GoldDot size={4} style={{ top:"18%",  left:"22%"  }} delay="0s"   />
      <GoldDot size={3} style={{ top:"30%",  left:"14%"  }} delay="1.2s" />
      <GoldDot size={5} style={{ top:"22%",  right:"20%" }} delay="0.6s" />
      <GoldDot size={3} style={{ top:"60%",  right:"15%" }} delay="1.8s" />
      <GoldDot size={4} style={{ bottom:"22%",left:"30%" }} delay="2.5s" />
      <GoldDot size={3} style={{ bottom:"32%",right:"26%"}} delay="0.4s" />
      <GoldDot size={6} style={{ top:"42%",  left:"5%"   }} delay="3.2s" />
      <GoldDot size={3} style={{ top:"50%",  right:"6%"  }} delay="1.6s" />
      <GoldDot size={4} style={{ top:"72%",  left:"18%"  }} delay="0.9s" />
      <GoldDot size={3} style={{ top:"15%",  right:"36%" }} delay="2.1s" />

      {/* ── BG Layer 8: large spinning gold ring top-right ── */}
      <div className="absolute pointer-events-none"
        style={{ top:"-30px", right:"-30px", animation:"spinSlow 55s linear infinite", opacity:0.65 }}>
        <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
          {[140,115,90,65,40].map((r,i) => (
            <circle key={r} cx="160" cy="160" r={r}
              stroke={GOLD} strokeWidth={i===0?1.2:0.6}
              opacity={0.14 - i*0.02}
              strokeDasharray={i%2===0 ? "6 5" : "3 8"} />
          ))}
          <circle cx="160" cy="160" r="5" fill={GOLD} opacity="0.4" />
        </svg>
      </div>

      {/* ── BG Layer 9: medium spinning ring bottom-left ── */}
      <div className="absolute pointer-events-none"
        style={{ bottom:"-20px", left:"-20px", animation:"spinSlowReverse 70s linear infinite", opacity:0.5 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          {[95,70,45].map((r,i) => (
            <circle key={r} cx="110" cy="110" r={r}
              stroke={GOLD} strokeWidth="0.6"
              opacity={0.13 - i*0.03}
              strokeDasharray={i%2===0 ? "5 6" : "2 8"} />
          ))}
          <circle cx="110" cy="110" r="4" fill={GOLD} opacity="0.35" />
        </svg>
      </div>

      {/* ── BG Layer 10: decorative half-arc behind content, center-bottom ── */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        width="900" height="200" viewBox="0 0 900 200" fill="none" style={{ opacity:0.07 }}>
        <path d="M0 200 Q450 -60 900 200" stroke="#14532d" strokeWidth="1.5" fill="none"
          strokeDasharray="900" style={{ animation:"drawLine 2s 1s ease forwards", strokeDashoffset:900 }} />
        <path d="M50 200 Q450 -20 850 200" stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.8"
          strokeDasharray="860" style={{ animation:"drawLine 2.2s 1.3s ease forwards", strokeDashoffset:860 }} />
      </svg>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

        {/* Badge */}
        <Badge className="mb-6 gap-1.5 border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase animate-[fadeUp_0.6s_ease_both]"
          style={{ fontFamily:"var(--font-dm)", background:"rgba(20,83,45,0.08)",
            borderColor:"rgba(20,83,45,0.2)", color:"#166534" }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background:"#16a34a", boxShadow:"0 0 6px #16a34a" }} />
          Now live in Gainesville, FL
        </Badge>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-[5.8rem] font-extrabold tracking-tight leading-[1.0] text-green-950 mb-5 animate-[fadeUp_0.7s_0.08s_ease_both]"
          style={{ fontFamily:"var(--font-bricolage)" }}>
          Discover{" "}
          <span className="relative inline-block">
            <span className="relative z-10" style={gText(GT.accent)}>green spaces</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 320 14"
              fill="none" preserveAspectRatio="none">
              <path d="M2 10 Q80 3 160 8 Q240 13 318 6"
                stroke={GOLD} strokeWidth="3" strokeLinecap="round"
                strokeDasharray="320" opacity="0.9"
                style={{ animation:"drawLine 1.2s 0.6s ease forwards", strokeDashoffset:320 }} />
            </svg>
          </span>
          <br />near you.
        </h1>

        {/* Sub */}
        <p className="text-lg text-green-900/55 max-w-[520px] leading-relaxed mb-10 animate-[fadeUp_0.7s_0.18s_ease_both]"
          style={{ fontFamily:"var(--font-dm)", fontWeight:300 }}>
          GatorGreen maps every park, trail, and garden around you — with
          personalized recommendations, saved favorites, and real-time
          exploration built in.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center animate-[fadeUp_0.7s_0.28s_ease_both]">
          <Button size="lg"
            className="shiny-btn text-green-50 gap-2.5 px-7 py-6 text-base font-semibold transition-all hover:-translate-y-0.5"
            style={{ fontFamily:"var(--font-dm)", background: G.deep,
              boxShadow:"0 6px 24px rgba(20,83,45,0.45), inset 0 1px 0 rgba(255,255,255,0.13)" }}
            onMouseEnter={e => { e.currentTarget.style.background = G.mid; e.currentTarget.style.boxShadow = "0 10px 32px rgba(20,83,45,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = G.deep; e.currentTarget.style.boxShadow = "0 6px 24px rgba(20,83,45,0.45), inset 0 1px 0 rgba(255,255,255,0.13)"; }}>
            <GoogleIcon className="w-[18px] h-[18px]" />
            Continue with Google
          </Button>
          <Button size="lg" variant="outline"
            className="gap-2 px-7 py-6 text-base font-medium transition-all hover:-translate-y-0.5"
            style={{ fontFamily:"var(--font-dm)", borderColor:`${GOLD}55`,
              color:"#166534", background:GOLD_PALE }}
            onMouseEnter={e => e.currentTarget.style.borderColor=`${GOLD}AA`}
            onMouseLeave={e => e.currentTarget.style.borderColor=`${GOLD}55`}>
            Explore the map <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 flex gap-12 flex-wrap justify-center animate-[fadeUp_0.7s_0.42s_ease_both]">
          {[
            { val:"120+",   label:"Green Spaces" },
            { val:"4.9★",   label:"Avg. Rating"  },
            { val:"2,400+", label:"Explorers"    },
          ].map(({ val, label }, i) => (
            <div key={label} className="text-center relative">
              {/* Subtle gold divider between stats */}
              {i > 0 && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-px h-8"
                  style={{ background:`linear-gradient(to bottom, transparent, ${GOLD}55, transparent)` }} />
              )}
              <div className="text-3xl font-bold"
                style={{ fontFamily:"var(--font-bricolage)", color:"#1a4d2e" }}>{val}</div>
              <div className="text-xs mt-1 uppercase tracking-widest"
                style={{ fontFamily:"var(--font-dm)", color:"rgba(20,83,45,0.45)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-35 pointer-events-none"
        style={{ animation:"bob 2.5s ease-in-out infinite" }}>
        <div className="w-px h-8 bg-green-800" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-800" />
      </div>
    </section>
  );
}

/* ── Map Preview ──────────────────────────────────────────── */
function MapPreview() {
  return (
    <section id="features" className="relative bg-white py-24 px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[400px]"
          style={{ background:`radial-gradient(ellipse at top right, ${GOLD_PALE} 0%, transparent 65%)` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px]"
          style={{ background:"radial-gradient(ellipse at bottom left, rgba(20,83,45,0.04) 0%, transparent 70%)" }} />
      </div>
      <HexGrid opacity={0.016} />

      {/* Corner leaves */}
      <div className="absolute top-6 right-6 pointer-events-none opacity-70"
        style={{ animation:"floatB 10s 0.5s ease-in-out infinite" }}>
        <LeafSVG size={58} color="#166534" opacity={0.12} style={{ transform:"scaleX(-1) rotate(10deg)" }} />
      </div>
      <div className="absolute bottom-8 left-5 pointer-events-none opacity-60"
        style={{ animation:"floatA 12s 2s ease-in-out infinite" }}>
        <LeafSVG size={48} color="#14532d" opacity={0.10} style={{ transform:"rotate(25deg)" }} />
      </div>
      <GoldDot size={4} style={{ top:"15%", right:"15%", position:"absolute" }} delay="0.8s" />
      <GoldDot size={3} style={{ bottom:"20%", left:"12%", position:"absolute" }} delay="2s" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
        {/* Map mockup */}
        <Reveal dir="left" delay="0s" className="order-2 lg:order-1">
        <div className="relative rounded-3xl overflow-hidden border shadow-2xl aspect-[4/3]"
          style={{ borderColor:"rgba(20,83,45,0.12)",
            boxShadow:`0 30px 80px rgba(20,83,45,0.12), 0 0 0 1px rgba(20,83,45,0.05), 0 0 0 4px ${GOLD_PALE}` }}>
          <div className="absolute inset-0" style={{
            background:"#e8f0e9",
            backgroundImage:"linear-gradient(rgba(34,197,94,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.07) 1px, transparent 1px)",
            backgroundSize:"36px 36px",
          }} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
            <defs>
              <radialGradient id="pin1" cx="35%" cy="25%" r="70%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#14532d" />
              </radialGradient>
              <radialGradient id="pin2" cx="35%" cy="25%" r="70%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#0f3d22" />
              </radialGradient>
            </defs>
            <path d="M0 150 Q100 143 200 152 Q300 161 400 147" stroke="white" strokeWidth="10" opacity="0.65" />
            <path d="M196 0 Q191 80 194 150 Q197 222 196 300" stroke="white" strokeWidth="7" opacity="0.55" />
            <path d="M0 235 Q180 225 400 240" stroke="white" strokeWidth="5" opacity="0.45" />
            <path d="M68 0 Q63 100 70 300" stroke="white" strokeWidth="4" opacity="0.4" />
            <rect x="84" y="60" width="126" height="92" rx="10"
              fill="rgba(21,128,61,0.14)" stroke="rgba(21,128,61,0.25)" strokeWidth="1.5" />
            <text x="147" y="109" textAnchor="middle" fill="#166534" fontSize="9"
              fontFamily="sans-serif" fontWeight="600" opacity="0.85">Depot Park</text>
            {[
              { cx:147, cy:96,  g:"url(#pin1)" },
              { cx:264, cy:141, g:"url(#pin2)" },
              { cx:318, cy:60,  g:"url(#pin1)" },
              { cx:94,  cy:204, g:"url(#pin2)" },
            ].map(({ cx, cy, g }, i) => (
              <g key={i} transform={`translate(${cx},${cy})`}>
                <circle r="16" fill={g} opacity="0.12" />
                <circle r="9"  fill={g} />
                <circle r="3.5" fill="white" opacity="0.9" />
                <circle r="3" fill="white" opacity="0.3" cx="-1.5" cy="-2" />
              </g>
            ))}
            <text x="147" y="76" textAnchor="middle" fontSize="11" opacity="0.8">⭐</text>
          </svg>
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {["+","−"].map(s => (
              <div key={s} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-green-900/10 flex items-center justify-center text-green-800 text-sm font-semibold cursor-pointer hover:bg-green-50 transition-colors">{s}</div>
            ))}
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3 border shadow-lg"
            style={{ borderColor:`${GOLD}22` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: G.mid, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(20,83,45,0.35)" }}>
              <Leaf className="w-5 h-5 text-green-100" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-950 leading-tight" style={{ fontFamily:"var(--font-bricolage)" }}>Depot Park</p>
              <p className="text-xs text-green-800/50 mt-0.5" style={{ fontFamily:"var(--font-dm)" }}>0.3 mi · Open now · ⭐ 4.8</p>
            </div>
            <Button size="sm" className="shiny-btn text-white text-xs px-3 h-8 shrink-0 border-0"
              style={{ background: G.deep, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" }}>View</Button>
          </div>
        </div>
        </Reveal>

        {/* Text side */}
        <Reveal dir="right" delay="0.1s" className="order-1 lg:order-2">
        <div>
          <span className="text-xs font-bold tracking-[0.12em] uppercase block mb-3"
            style={{ fontFamily:"var(--font-dm)", color:GOLD }}>Interactive Map</span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-green-950 leading-[1.08] tracking-tight mb-5"
            style={{ fontFamily:"var(--font-bricolage)" }}>
            Every trail & park —<br />
            <em className="not-italic" style={gText(GT.accent)}>at a glance.</em>
          </h2>
          <p className="text-base text-green-900/55 leading-relaxed max-w-[400px] mb-8"
            style={{ fontFamily:"var(--font-dm)", fontWeight:300 }}>
            Powered by Leaflet. Filter by type, distance, or rating.
            Real-time data means you always see the freshest conditions.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { Icon:Map,    title:"Filter by type",  desc:"Parks, trails, gardens, dog-friendly & more" },
              { Icon:MapPin, title:"Your location",   desc:"Instant proximity search from wherever you are" },
              { Icon:Star,   title:"Community rated", desc:"Real reviews from Gainesville explorers" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                  style={{ background:GOLD_PALE, borderColor:GOLD_RING }}>
                  <Icon className="w-[18px] h-[18px] text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-950" style={{ fontFamily:"var(--font-bricolage)" }}>{title}</p>
                  <p className="text-sm text-green-900/50 mt-0.5" style={{ fontFamily:"var(--font-dm)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────────── */
const FEATURES = [
  { Icon:Heart,         title:"Save Favorites",   desc:"Bookmark spaces to build your personal green collection.", gold: false },
  { Icon:Sparkles,      title:"Smart Recs",        desc:"Personalized suggestions based on your history & vibe.",  gold: true  },
  { Icon:Route,         title:"Trail Details",     desc:"Difficulty, distance, photos & reviews for every trail.", gold: false },
  { Icon:CloudSun,      title:"Live Conditions",   desc:"Weather overlays & crowd reports before you leave.",      gold: true  },
  { Icon:MessageSquare, title:"Community Notes",   desc:"Leave tips, report closures, and share photos.",          gold: false },
  { Icon:Award,         title:"Explorer Badges",   desc:"Earn achievements as you hit discovery milestones.",      gold: true  },
];

function Features() {
  return (
    <section className="relative bg-stone-50 py-24 px-6 overflow-hidden">
      {/* Vine clusters in opposite corners */}
      <VineCluster corner="tr" color="#15803d" />
      <VineCluster corner="bl" color="#166534" goldAccent />
      <HexGrid opacity={0.022} />
      <GoldDot size={4} style={{ top:"10%", left:"40%", position:"absolute" }} delay="1s" />
      <GoldDot size={3} style={{ bottom:"12%", right:"35%", position:"absolute" }} delay="2.3s" />

      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal dir="up" delay="0s">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.12em] uppercase block mb-3"
            style={{ fontFamily:"var(--font-dm)", color:GOLD }}>Everything you need</span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-green-950 tracking-tight leading-[1.08]"
            style={{ fontFamily:"var(--font-bricolage)" }}>Built for <em className="not-italic" style={gText(GT.accent)}>every explorer.</em></h2>
        </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc, gold }, i) => (
            <Reveal key={title} dir="up" delay={`${i * 0.07}s`}>
            <Card className="feature-card border bg-white shadow-none rounded-2xl transition-all duration-300 cursor-default h-full"
              style={{ borderColor: gold ? GOLD_RING : "rgba(20,83,45,0.08)" }}>
              {gold && <div className="h-[2px] w-full rounded-t-2xl"
                style={{ background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />}
              <CardContent className="p-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: gold ? GOLD_PALE : G.mid,
                    border: `1px solid ${gold ? GOLD_RING : "rgba(255,255,255,0.08)"}`,
                    boxShadow: gold ? "none" : "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(20,83,45,0.3)",
                  }}>
                  <Icon className="w-5 h-5" style={{ color: gold ? GOLD : "#d1fae5" }} />
                </div>
                <h3 className="text-base font-bold text-green-950 mb-1.5" style={{ fontFamily:"var(--font-bricolage)" }}>{title}</h3>
                <p className="text-sm text-green-900/50 leading-relaxed" style={{ fontFamily:"var(--font-dm)" }}>{desc}</p>
              </CardContent>
            </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ─────────────────────────────────────────── */
const STEPS = [
  { num:"01", icon:<GoogleIcon className="w-6 h-6" />,                     title:"Sign in with Google", desc:"One click. No passwords, no friction — just your Google account." },
  { num:"02", icon:<MapPin className="w-6 h-6 text-green-700" />,          title:"Share your location", desc:"We surface the best nearby parks, trails & gardens instantly."      },
  { num:"03", icon:<Leaf    className="w-6 h-6 text-green-700" />,         title:"Explore & save",      desc:"Browse the live map, read reviews, and save your favorites."         },
];

function HowItWorks() {
  return (
    <section id="how" className="relative bg-white py-24 px-6 overflow-hidden">
      {/* Big centered gold ring watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ animation:"spinSlow 80s linear infinite", opacity:0.35 }}>
        <svg width="600" height="600" viewBox="0 0 600 600" fill="none">
          {[280,240,200,160].map((r,i) => (
            <circle key={r} cx="300" cy="300" r={r}
              stroke={GOLD} strokeWidth="0.6" opacity={0.12 - i*0.02}
              strokeDasharray={i%2===0?"7 6":"3 10"} />
          ))}
        </svg>
      </div>
      <VineCluster corner="tl" color="#14532d" />
      <VineCluster corner="br" color="#166534" goldAccent />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Reveal dir="up" delay="0s">
        <span className="text-xs font-bold tracking-[0.12em] uppercase block mb-3"
          style={{ fontFamily:"var(--font-dm)", color:GOLD }}>Simple by design</span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-green-950 tracking-tight leading-[1.08] mb-16"
          style={{ fontFamily:"var(--font-bricolage)" }}>
          Up and exploring{" "}
          <em className="not-italic" style={gText(GT.accent)}>in under a minute.</em>
        </h2>
        </Reveal>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Gold connector line */}
          <div className="hidden sm:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px pointer-events-none"
            style={{ background:`linear-gradient(90deg, ${GOLD}44, ${GOLD}BB, ${GOLD}44)` }} />

          {STEPS.map(({ num, icon, title, desc }, i) => (
            <Reveal key={num} dir="up" delay={`${i * 0.12}s`}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-5">
                {/* Outer pulse ring */}
                <div className="absolute inset-[-8px] rounded-full pointer-events-none"
                  style={{ border:`1px solid ${GOLD}33`, animation:"goldPulse 3s ease-in-out infinite" }} />
                <div className="w-20 h-20 rounded-full bg-stone-50 flex flex-col items-center justify-center gap-0.5 shadow-sm"
                  style={{ border:`2px solid ${GOLD}55` }}>
                  {icon}
                  <span className="text-[10px] font-bold tracking-wider"
                    style={{ fontFamily:"var(--font-bricolage)", color:GOLD }}>{num}</span>
                </div>
              </div>
              <h3 className="text-base font-bold text-green-950 mb-1.5" style={{ fontFamily:"var(--font-bricolage)" }}>{title}</h3>
              <p className="text-sm text-green-900/50 leading-relaxed" style={{ fontFamily:"var(--font-dm)" }}>{desc}</p>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ───────────────────────────────────────────── */
function CTA() {
  return (
    <section className="relative bg-stone-50 py-24 px-6 overflow-hidden">
      <HexGrid opacity={0.02} />
      <VineCluster corner="tl" color="#166534" />
      <VineCluster corner="br" color="#14532d" goldAccent />
      <GoldDot size={4} style={{ top:"20%", right:"20%", position:"absolute" }} delay="0.5s" />
      <GoldDot size={3} style={{ bottom:"25%", left:"22%", position:"absolute" }} delay="1.8s" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Reveal dir="scale" delay="0s">
        <div className="relative rounded-3xl px-10 py-16 text-center overflow-hidden"
          style={{ background: G.panel,
            boxShadow:`0 32px 80px rgba(20,83,45,0.45), 0 0 0 1px rgba(255,255,255,0.05), 0 0 0 3px ${GOLD}18` }}>

          {/* Inner dot texture */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage:"radial-gradient(circle, #86efac 1px, transparent 1px)",
              backgroundSize:"22px 22px", opacity:0.035 }} />

          {/* Inner glow blobs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background:"rgba(34,197,94,0.15)" }} />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{ background:"rgba(21,128,61,0.12)" }} />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-2xl pointer-events-none"
            style={{ background:`${GOLD}16` }} />

          {/* Inner spinning gold ring */}
          <div className="absolute -bottom-20 -right-20 pointer-events-none"
            style={{ animation:"spinSlow 50s linear infinite", opacity:0.3 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              {[85,60,38].map(r => (
                <circle key={r} cx="100" cy="100" r={r}
                  stroke={GOLD} strokeWidth="0.8" opacity="0.4" strokeDasharray="5 5" />
              ))}
            </svg>
          </div>

          {/* Inner vine leaves */}
          <div className="absolute top-4 left-6 pointer-events-none"
            style={{ animation:"floatA 8s ease-in-out infinite" }}>
            <LeafSVG size={38} color="#86efac" opacity={0.14} style={{ transform:"rotate(20deg)" }} />
          </div>
          <div className="absolute top-5 right-7 pointer-events-none"
            style={{ animation:"floatB 10s 1s ease-in-out infinite" }}>
            <LeafSVG size={34} color="#86efac" opacity={0.11} style={{ transform:"scaleX(-1) rotate(10deg)" }} />
          </div>
          <div className="absolute bottom-5 left-10 pointer-events-none"
            style={{ animation:"floatC 9s 2s ease-in-out infinite" }}>
            <LeafSVG size={30} color="#4ade80" opacity={0.10} style={{ transform:"rotate(-20deg)" }} />
          </div>

          {/* Inner gold dust */}
          <GoldDot size={3} style={{ position:"absolute", top:"20%", left:"12%"   }} delay="0s"   />
          <GoldDot size={4} style={{ position:"absolute", top:"28%", right:"10%"  }} delay="1.3s" />
          <GoldDot size={3} style={{ position:"absolute", bottom:"22%", left:"20%"}} delay="2.1s" />
          <GoldDot size={3} style={{ position:"absolute", bottom:"18%", right:"18%"}} delay="0.7s" />

          {/* Content */}
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 100%)", border:`1.5px solid ${GOLD}55`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}>
              <Leaf className="w-7 h-7 text-green-200" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-4"
              style={{ fontFamily:"var(--font-bricolage)", ...gText(GT.light) }}>
              Your next favorite<br />spot is waiting.
            </h2>
            <p className="text-base text-green-200/60 leading-relaxed max-w-md mx-auto mb-10"
              style={{ fontFamily:"var(--font-dm)", fontWeight:300 }}>
              Join thousands of Gainesville explorers discovering hidden parks,
              peaceful trails, and vibrant community gardens.
            </p>
            <Button size="lg"
              className="shiny-btn text-green-900 font-semibold gap-2.5 px-8 py-6 text-base transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                fontFamily:"var(--font-dm)",
                background:`linear-gradient(110deg, #f5f0e8 0%, ${GOLD_LIGHT} 38%, #fffdf5 52%, ${GOLD_LIGHT} 66%, #f5f0e8 100%)`,
                backgroundSize:"250% auto",
                animation:"shimmer 4s linear infinite",
                boxShadow:`0 4px 24px ${GOLD}55`,
              }}>
              <GoogleIcon className="w-[18px] h-[18px]" />
              Get started — it's free
            </Button>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden"
      style={{ background: G.footer, borderTop:`1px solid ${GOLD}22` }}>
      {/* Faint hex in footer */}
      <HexGrid opacity={0.025} color="#4ade80" />
      <div className="flex items-center gap-2 relative z-10">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: G.mid, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" }}>
          <Leaf className="w-3.5 h-3.5 text-green-200" />
        </div>
        <span className="font-bold text-base" style={{ fontFamily:"var(--font-bricolage)", ...gText(GT.light) }}>GatorGreen</span>
      </div>
      <p className="text-green-500/55 text-xs relative z-10" style={{ fontFamily:"var(--font-dm)" }}>
        © {new Date().getFullYear()} GatorGreen · University of Florida
      </p>
      <div className="flex gap-5 relative z-10">
        {["Privacy","Terms","Contact"].map(link => (
          <a key={link} href="#"
            className="text-xs text-green-400/45 hover:text-green-300 transition-colors"
            style={{ fontFamily:"var(--font-dm)" }}>{link}</a>
        ))}
      </div>
    </footer>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
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