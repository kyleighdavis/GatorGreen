"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {MapPin} from "lucide-react";

const gText = (grad) => ({
  background: grad, 
  WebkitBackgroundClip : "text",
  WebkitTextFillColor : "transparent",
  backgroundClip : "text",
});

function LeafSVG({size = 50, color = "#16a34a", opacity = .15, style = {}}) {
  return (
    <svg width = {size} height = {size * 1.5} viewBox = "0 0 80 120" fill = "none" style = {style}> 
    <path d = "M40 150 C40 115 5 80 5 48 C5 22 22 5 40 5 C58 5 75 22 75 48 C75 80 40 115 40 115Z" fill = {color} opacity = {opacity} />
    <path d = "M40 115 L40 5" stroke = {color} strokeWidth = "1.2" opacity = {opacity * 1.6} />
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

export default function Onboarding() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState({ lat : null, lng : null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const completed = localStorage.getItem("onboardingComplete");
    if (completed == "true") {
      // Redirect to dashboard or home page
      window.location.href = "/dashboard";
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    
navigator.geolocation.getCurrentPosition(
  (pos) => {
    setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    });
  },
  () => {
    console.log("location error");
  }
);
      }, []);

const handleSubmit = () => {
  if (!firstName || !lastName || !email || !address || !city || !state || !country) {
    setError("Please fill in all fields!");
    return;
  }
  setLoading(true);
  setError("");

  console.log("Onboarding data:", {
    firstName,
    lastName,
    email,
    address,
    city,
    state,
    country,
    location,
  });

  localStorage.setItem("onboardingComplete", "true");
  window.location.href = "/dashboard";
  setLoading(false);
};
          
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden p-6">
      <GoldDot style={{ top : 60, left: 40}} />
      <GoldDot style = {{top : 120, right: 50}} delay = "1s" />
      <GoldDot style = {{bottom : 100, left: 80}} delay = "0.5s" />

      <h1 
      style = {gText("linear-gradient(135deg, #0a3e18 0%, #22c55e 65%, #15803d 100%)")}
      className="text-5xl font-extrabold mb-6 text-center"
      >
        Personal Information 
      </h1>

      <Card className="w-full max-w-md p-10 bg-white/20 backdrop-blur-md border border-[#C9A84C33] rounded-2xl shadow-2xl">
        <CardContent>
          <h2 
          style = {gText("linear-gradient(135deg, #0a3e18 0%, #22c55e 65%, #15803d 100%)")}
          className = "text-4xl font-bold text-center mb-2"
          >
            Welcome!
          </h2>

          <p className = "text-green-300 text-center text-lg font-semibold mb-5">
            Let's set up your profile
          </p>

          <form
          onSubmit = {(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className = "flex flex-col gap-4"
          >
            <input placeholder = "First Name" value = {firstName} onChange = {(e) => setFirstName(e.target.value)} className = "input" />
            <input placeholder = "Last Name" value = {lastName} onChange = {(e) => setLastName(e.target.value)} className = "input" />
            <input type = "email" placeholder = "Email" value = {email} onChange = {(e) => setEmail(e.target.value)} className = "input" />
            <input placeholder = "Address" value = {address} onChange = {(e) => setAddress(e.target.value)} className = "input" />
            <input placeholder = "City" value = {city} onChange = {(e) => setCity(e.target.value)} className = "input" />
            <input placeholder = "State" value = {state} onChange = {(e) => setState(e.target.value)} className = "input" />
            <input placeholder = "Country" value = {country} onChange = {(e) => setCountry(e.target.value)} className = "input" />

            {location.lat && location.lng && (
              <div className = "flex items-center gap-2 text-green-300 text-sm">
                <MapPin />
              </div>
            )}

            {error && <p className = "text-red-400 text-sm">{error}</p>}
            <Button 
            type = "submit"
            className = "mt-4 bg-gradient-to-r from-[#15803d] via-[#22c55e] to-[#4ade80] text-white font-bold text-lg hover:scale-105 transition"
            disabled = {loading}
            >
              {loading ? "Saving..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <LeafSVG style = {{position : "absolute", top : 40, left: 10, transform: "rotate(-30deg)" }} />
      <LeafSVG style = {{position : "absolute", bottom : 50, right: 20, transform: "rotate(40deg)" }} />
      <style>{`
      .input {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 16px;
        width: 100%;
        color: black;
      }

      @keyframes drift {
        0%, 100%{ transform: translate(0, 0); opacity: 0.6; }
        50% { transform: translate(8px, -10px) rotate(0deg); }
      }
      `}</style>
    </div>
  );
}


// I used chatgpt to help me understand how to create this onboarding page 
// I used sites like geeksforgeeks and stackoverflow to understand how to structure this 
// AnnaRose 