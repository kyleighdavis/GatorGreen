"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const gText = (grad) => ({
  background: grad,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
});

function LeafSVG({ size = 50, color = "#16a34a", opacity = .15, style = {} }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 80 120" fill="none" style={style}>
      <path d="M40 150 C40 115 5 80 5 48 C5 22 22 5 40 5 C58 5 75 22 75 48 C75 80 40 115 40 115Z" fill={color} opacity={opacity} />
      <path d="M40 115 L40 5" stroke={color} strokeWidth="1.2" opacity={opacity * 1.6} />
    </svg>
  );
}

function GoldDot({ size = 7, style = {}, delay = "0s" }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: "#C9A84C",
      boxShadow: `0 0 ${size * 3}px #C9A84C88`,
      position: "absolute",
      animation: `drift ${4 + size * 0.5}s ${delay} ease-in-out infinite`,
      ...style
    }} />
  );
}

const ROLE_OPTIONS = [
  { value: "explorer",    label: "Explorer — I enjoy outdoor spaces for recreation" },
  { value: "naturalist",  label: "Naturalist — I study flora, fauna, and ecosystems" },
  { value: "park_ranger", label: "Park Ranger / Professional" },
];

const ACTIVITY_PRESETS = [
  "Hiking", "Bird watching", "Photography", "Trail running",
  "Dog walking", "Picnicking", "Kayaking", "Cycling",
  "Meditation", "Wildlife observation", "Botany", "Fishing",
];

const RADIUS_OPTIONS = [5, 10, 20, 50];

export default function Onboarding() {
  const router   = useRouter();
  const supabase = createClient();

  const [role,          setRole]          = useState("");
  const [activities,    setActivities]    = useState([]);
  const [customAct,     setCustomAct]     = useState("");
  const [maxRadius,     setMaxRadius]     = useState(10);
  const [location,      setLocation]      = useState({ lat: null, lng: null });
  const [loading,       setLoading]       = useState(false);
  const [initLoading,   setInitLoading]   = useState(true);
  const [error,         setError]         = useState("");
  const [user,          setUser]          = useState(null);

  
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_activities, role, max_radius")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.preferred_activities) { //Edit onboarding details
        if (profile.role){
          setRole(profile.role);
        }

        //Disassemble so user can see previous selections
        if (profile.preferred_activities){
          const known = ACTIVITY_PRESETS.filter(a =>
              profile.preferred_activities.includes(a)
          );
          
          const custom = profile.preferred_activities
                .split(", ")
                .filter(a => !ACTIVITY_PRESETS.includes(a))
                .join(", ");
            setActivities(known);
            setCustomAct(custom);
        }

        if (profile.max_radius){
          setMaxRadius(profile.max_radius);
        }

      }
      setInitLoading(false);
    };
    init();

    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("location error")
      );
    }
  }, []);

  const toggleActivity = (act) =>
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );

  const buildActivityString = () => {
    const all = [...activities];
    if (customAct.trim())
      all.push(...customAct.split(",").map((s) => s.trim()).filter(Boolean));
    return all.join(", ");
  };

  const handleSubmit = async () => {
    if (!role) { setError("Please select your role."); return; }
    if (activities.length === 0 && !customAct.trim()) {
      setError("Please select at least one activity.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const activityString = buildActivityString();

      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id:                   user.id,
            role:                 role,
            preferred_activities: activityString,
            max_radius:           maxRadius,
            ...(location.lat ? { lat: location.lat, long: location.lng } : {}),
          },
          { onConflict: "id" }
        );

      if (dbErr) {
        console.error("Supabase error:", dbErr);
        setError(`Error: ${dbErr.message}`);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div style={{ width: 32, height: 32, border: "3px solid #dcfce7",
          borderTop: "3px solid #16a34a", borderRadius: "50%",
          animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden p-6">
      <GoldDot style={{ top: 60, left: 40 }} />
      <GoldDot style={{ top: 120, right: 50 }} delay="1s" />
      <GoldDot style={{ bottom: 100, left: 80 }} delay="0.5s" />

      <h1
        style={gText("linear-gradient(135deg, #0a3e18 0%, #22c55e 65%, #15803d 100%)")}
        className="text-5xl font-extrabold mb-6 text-center"
      >
        Personal Information
      </h1>

      <Card className="w-full max-w-md p-10 bg-white/20 backdrop-blur-md border border-[#C9A84C33] rounded-2xl shadow-2xl">
        <CardContent>
          <h2
            style={gText("linear-gradient(135deg, #0a3e18 0%, #22c55e 65%, #15803d 100%)")}
            className="text-4xl font-bold text-center mb-2"
          >
            Welcome!
          </h2>

          <p className="text-green-800 text-center text-lg font-semibold mb-5">
            Let&apos;s set up your profile
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="flex flex-col gap-4"
          >
            
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">
                I am a…
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-green-500 outline-none transition-all bg-white/80"
              >
                <option value="" disabled>Select your role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">
                Preferred Activities
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {ACTIVITY_PRESETS.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleActivity(act)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      activities.includes(act)
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-green-800 border-gray-200 hover:border-green-400"
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Other activities (comma separated)"
                value={customAct}
                onChange={(e) => setCustomAct(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-green-500 outline-none transition-all bg-white/80"
              />
            </div>

           
            <div>
              <label className="block text-sm font-medium text-green-900 mb-2">
                Max Travel Distance
              </label>
              <div className="flex gap-2">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMaxRadius(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      maxRadius === r
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-green-800 border-gray-200 hover:border-green-400"
                    }`}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
            </div>

            {location.lat && (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <MapPin size={16} /> Location detected
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm font-medium text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="mt-4 bg-gradient-to-r from-[#15803d] via-[#22c55e] to-[#4ade80] text-white font-bold text-lg hover:scale-105 transition shadow-lg"
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <LeafSVG style={{ position: "absolute", top: 40, left: 10, transform: "rotate(-30deg)" }} />
      <LeafSVG style={{ position: "absolute", bottom: 50, right: 20, transform: "rotate(40deg)" }} />

      <style jsx global>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(8px, -10px); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
// I used chatgpt to help me understand how to create this onboarding page 
// I used sites like geeksforgeeks and stackoverflow to understand how to structure this 
// AnnaRose 