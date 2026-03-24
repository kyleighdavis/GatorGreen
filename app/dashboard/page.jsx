"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "leaflet/dist/leaflet.css";

const MapWithNoSSR = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", background: "#f0fdf4", display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      Loading Map...
    </div>
  ),
});

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TYPE_OPTIONS = ["park","garden","trail","wetland","nature_preserve","greenway"];
const TYPE_EMOJI   = {
  park:"🌳", garden:"🌸", trail:"🥾",
  wetland:"🦆", nature_preserve:"🌿", greenway:"🚴",
};

const inputStyle = {
  width:"100%", padding:"10px", borderRadius:"8px",
  border:"1px solid #cbd5e1", fontSize:"14px",
  outline:"none", boxSizing:"border-box", background:"white", color:"black",
};
const btnStyle = {
  padding:"10px", borderRadius:"8px", border:"none",
  background:"#16a34a", color:"white", fontWeight:"600",
  cursor:"pointer", transition:"0.2s", fontSize:"14px",
};

/* ─────────────────────────────────────────────────────────────
   SHARED: PastSearches
───────────────────────────────────────────────────────────── */
function PastSearches({ searches, onSelect }) {
  const [openIdx, setOpenIdx] = useState(null);

  if (searches === null) return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ height:52, borderRadius:10, background:"#f0fdf4",
          border:"1px solid #dcfce7", animation:`pulse 1.6s ${i*.12}s ease-in-out infinite` }} />
      ))}
    </div>
  );

  if (searches.length === 0) return (
    <p style={{ fontSize:13, color:"#16a34a", opacity:.6, textAlign:"center", marginTop:20 }}>
      No past searches yet.
    </p>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {searches.map((search, i) => {
        const spaces = search.spaces || [];
        const isOpen = openIdx === i;
        const label  = search.location_name || search.address
          || (search.lat ? `${parseFloat(search.lat).toFixed(3)}, ${parseFloat(search.long).toFixed(3)}` : "Unknown location");
        const date   = new Date(search.created_at).toLocaleDateString("en-US",
          { month:"short", day:"numeric", year:"numeric" });

        return (
          <div key={search.id} style={{
            background: isOpen ? "#f0fdf4" : "#f8fafc",
            border:`1px solid ${isOpen ? "#86efac" : "#e2e8f0"}`,
            borderRadius:10, overflow:"hidden", transition:"border-color .15s",
          }}>
            <div onClick={() => { setOpenIdx(isOpen ? null : i); onSelect(spaces.map((s) => ({ name:s.name, lat:s.lat, lng:s.lng }))); }}
              style={{ padding:"12px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:"#14532d" }}>📍 {label}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
                  {date} · {spaces.length} space{spaces.length !== 1 ? "s" : ""} found
                </div>
              </div>
              <span style={{ fontSize:12, color:"#94a3b8" }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ borderTop:"1px solid #dcfce7" }}>
                {spaces.map((space, j) => (
                  <div key={j} style={{ padding:"10px 14px",
                    borderBottom: j < spaces.length-1 ? "1px solid #f0fdf4" : "none",
                    display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#14532d" }}>
                        {TYPE_EMOJI[space.type]||"📍"} {space.name}
                      </div>
                      {space.description && (
                        <div style={{ fontSize:11.5, color:"#64748b", marginTop:2, lineHeight:1.4 }}>
                          {space.description}
                        </div>
                      )}
                    </div>
                    {space.distance_miles != null && (
                      <span style={{ fontSize:11, color:"#16a34a", fontWeight:600, flexShrink:0 }}>
                        {space.distance_miles < 1
                          ? `${(space.distance_miles*5280).toFixed(0)} ft`
                          : `${space.distance_miles.toFixed(1)} mi`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RANGER: SpaceForm  (add or edit a single green space)
───────────────────────────────────────────────────────────── */
function SpaceForm({ initial = {}, onSave, onCancel, saving }) {
  const [name,        setName]        = useState(initial.name        || "");
  const [type,        setType]        = useState(initial.type        || "park");
  const [location,    setLocation]    = useState(initial.location    || "");
  const [lat,         setLat]         = useState(initial.lat         != null ? String(initial.lat)  : "");
  const [lng,         setLng]         = useState(initial.long        != null ? String(initial.long) : "");
  const [description, setDescription] = useState(initial.description || "");

  const isEdit  = !!initial.id;
  const canSave = name.trim() && lat && lng && type && location.trim();

  const rangerInput = {
    ...inputStyle,
    background:"#f8fafc",
    border:"1px solid #d1fae5",
    fontSize:13,
  };

  return (
    <div style={{
      background:"#f0fdf4", border:"1px solid #86efac",
      borderRadius:12, padding:"18px", display:"flex",
      flexDirection:"column", gap:10,
    }}>
      <div style={{ fontWeight:700, fontSize:14, color:"#14532d", marginBottom:2 }}>
        {isEdit ? "✏️ Edit Space" : "➕ Add New Space"}
      </div>

      <input
        placeholder="Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={rangerInput}
      />

      <input
        placeholder="Location * (e.g. Gainesville, FL)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={rangerInput}
      />

      <div style={{ display:"flex", gap:8 }}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ ...rangerInput, flex:1 }}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{TYPE_EMOJI[t]} {t.replace("_"," ")}</option>
          ))}
        </select>
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <input
          placeholder="Latitude *"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          style={{ ...rangerInput, flex:1 }}
        />
        <input
          placeholder="Longitude *"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          style={{ ...rangerInput, flex:1 }}
        />
      </div>

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        style={{ ...rangerInput, resize:"vertical", fontFamily:"inherit" }}
      />

      <div style={{ display:"flex", gap:8, marginTop:4 }}>
        <button
          onClick={() => onSave({ name, type, location, lat:parseFloat(lat), long:parseFloat(lng),
            description, slug: toSlug(name), ...(isEdit ? { id: initial.id } : {}) })}
          disabled={!canSave || saving}
          style={{ ...btnStyle, flex:2, background:"#15803d",
            opacity: canSave && !saving ? 1 : .5,
            cursor: canSave && !saving ? "pointer" : "not-allowed" }}
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Space"}
        </button>
        <button
          onClick={onCancel}
          style={{ ...btnStyle, flex:1, background:"white", color:"#64748b",
            border:"1px solid #e2e8f0" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RANGER: ManageTab
───────────────────────────────────────────────────────────── */
function ManageTab({ supabase, onMapUpdate }) {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState(null);
  const [searching,   setSearching]   = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true); setResults(null); setMsg(""); setShowAdd(false); setEditingId(null);
    const q = query.trim();
    const { data } = await supabase
      .from("green_spaces")
      .select("*")
      .or(`location.ilike.%${q}%,name.ilike.%${q}%`)
      .order("name");
    setResults(data || []);
    setSearching(false);
    onMapUpdate((data || []).map((s) => ({ name:s.name, lat:s.lat, lng:s.long })));
  };

  const handleSave = async (space) => {
    setSaving(true); setMsg("");
    const isEdit = !!space.id;

    if (isEdit) {
      const { error } = await supabase
        .from("green_spaces")
        .update({
          name:        space.name,
          slug:        space.slug,
          type:        space.type,
          lat:         space.lat,
          long:        space.long,
          location:    space.location,
          description: space.description,
        })
        .eq("id", space.id);

      if (error) { setMsg("❌ " + error.message); }
      else {
        setMsg("✅ Space updated");
        setEditingId(null);
        handleSearch();
      }
    } else {
      const { error } = await supabase
        .from("green_spaces")
        .upsert({ ...space }, { onConflict:"slug" });

      if (error) { setMsg("❌ " + error.message); }
      else {
        setMsg("✅ Space added");
        setShowAdd(false);
        handleSearch();
      }
    }
    setSaving(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* search bar */}
      <form onSubmit={handleSearch} style={{
        background:"#f0fdf4", padding:"16px 18px",
        borderRadius:12, border:"1px solid #dcfce7",
        display:"flex", flexDirection:"column", gap:10,
      }}>
        <div style={{ fontWeight:700, fontSize:"1rem", color:"#14532d" }}>
          🗂 Manage Green Spaces
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input
            placeholder="Search by location (e.g. Gainesville, FL)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ ...inputStyle, flex:1 }}
          />
          <button type="submit" disabled={searching || !query.trim()}
            style={{ ...btnStyle, padding:"10px 18px", whiteSpace:"nowrap",
              opacity: query.trim() ? 1 : .5 }}>
            {searching ? "..." : "Search"}
          </button>
        </div>
      </form>

      {msg && (
        <div style={{ fontSize:13, padding:"8px 12px", borderRadius:8,
          background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
          border:`1px solid ${msg.startsWith("✅") ? "#86efac" : "#fca5a5"}`,
          color: msg.startsWith("✅") ? "#15803d" : "#ef4444" }}>
          {msg}
        </div>
      )}

      {/* results */}
      {results !== null && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:"#64748b" }}>
              {results.length} space{results.length !== 1 ? "s" : ""} found
            </span>
            {!showAdd && (
              <button
                onClick={() => { setShowAdd(true); setEditingId(null); }}
                style={{ ...btnStyle, padding:"7px 14px", fontSize:13,
                  background:"white", color:"#16a34a", border:"1px solid #16a34a" }}
              >
                + Add New Space
              </button>
            )}
          </div>

          {/* add form */}
          {showAdd && (
            <SpaceForm
              onSave={handleSave}
              onCancel={() => setShowAdd(false)}
              saving={saving}
            />
          )}

          {results.length === 0 && !showAdd && (
            <p style={{ fontSize:13, color:"#94a3b8", textAlign:"center", margin:"8px 0" }}>
              No spaces found. Use "+ Add New Space" to create one.
            </p>
          )}

          {/* space rows */}
          {results.map((space) => (
            <div key={space.id}>
              {editingId === space.id ? (
                <SpaceForm
                  initial={space}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div style={{
                  background:"#f8fafc", border:"1px solid #e2e8f0",
                  borderRadius:10, padding:"12px 14px",
                  display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", gap:10,
                }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#14532d", marginBottom:3 }}>
                      {TYPE_EMOJI[space.type]||"📍"} {space.name}
                    </div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontSize:10, color:"#64748b", background:"#f1f5f9",
                        padding:"2px 7px", borderRadius:20, textTransform:"uppercase",
                        letterSpacing:".04em", fontWeight:600 }}>
                        {space.type?.replace("_"," ")}
                      </span>
                      {space.location && (
                        <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>
                          📍 {space.location}
                        </span>
                      )}
                      <span style={{ fontSize:11, color:"#94a3b8" }}>
                        {parseFloat(space.lat).toFixed(4)}, {parseFloat(space.long).toFixed(4)}
                      </span>
                    </div>
                    {space.description && (
                      <p style={{ fontSize:12, color:"#64748b", margin:"5px 0 0",
                        lineHeight:1.45 }}>
                        {space.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setEditingId(space.id); setShowAdd(false); }}
                    style={{ ...btnStyle, padding:"6px 13px", fontSize:12,
                      background:"white", color:"#14532d", border:"1px solid #d1fae5",
                      whiteSpace:"nowrap", flexShrink:0 }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RANGER DASHBOARD  (different left panel, same map)
───────────────────────────────────────────────────────────── */
function RangerDashboard({ profile, user, supabase, router }) {
  const [tab,          setTab]          = useState("search");
  const [locationName, setLocationName] = useState(profile?.name || "");
  const [address,      setAddress]      = useState("");
  const [lat,          setLat]          = useState(profile?.lat  ? String(profile.lat)  : "");
  const [lng,          setLng]          = useState(profile?.long ? String(profile.long) : "");
  const [isLocating,   setIsLocating]   = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [locError,     setLocError]     = useState("");
  const [apiError,     setApiError]     = useState("");
  const [spaces,       setSpaces]       = useState([]);
  const [activeIdx,    setActiveIdx]    = useState(null);
  const [searched,     setSearched]     = useState(false);
  const [searches,     setSearches]     = useState(null);
  const [mapLocations, setMapLocations] = useState([]);

  useEffect(() => { loadSearches(); }, []);

  const loadSearches = async () => {
    const { data } = await supabase.from("searches").select("*")
      .eq("user_id", user.id).order("created_at", { ascending:false }).limit(30);
    setSearches(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); router.push("/login");
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setIsLocating(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setAddress(""); setIsLocating(false);
      },
      () => { setLocError("Unable to retrieve location"); setIsLocating(false); }
    );
  };

  const handleFindSpaces = async (e) => {
    e.preventDefault();
    const hasCoords = lat && lng;
    const hasAddress = address.trim();
    if (!hasCoords && !hasAddress) { setLocError("Enter an address or use current location"); return; }
    setIsLoading(true); setApiError(""); setSpaces([]); setActiveIdx(null); setSearched(true);
    try {
      const res = await fetch("/api/find-spaces", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          name: locationName,
          ...(hasCoords ? { lat:parseFloat(lat), lng:parseFloat(lng) } : { address:hasAddress }),
          preferred_activities: profile?.preferred_activities ?? null,
          max_radius:           profile?.max_radius ?? 15,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      setSpaces(data.spaces);
      setMapLocations(data.spaces.map((s) => ({ name:s.name, lat:s.lat, lng:s.lng })));
      if (data.spaces.length > 0) {
        await supabase.from("green_spaces").upsert(
          data.spaces.map((s) => ({ name:s.name, slug:toSlug(s.name), type:s.type,
            lat:s.lat, long:s.lng, location:s.location??null, description:s.description ?? null })),
          { onConflict:"slug", ignoreDuplicates:true }
        );
        await supabase.from("searches").insert({
          user_id:user.id, location_name:locationName||null,
          address:hasAddress||null,
          lat: hasCoords ? parseFloat(lat) : null,
          long: hasCoords ? parseFloat(lng) : null,
          spaces: data.spaces,
        });
        loadSearches();
      }
    } catch (err) { setApiError(err.message); }
    finally { setIsLoading(false); }
  };

  const canSubmit = !!((lat && lng) || address.trim()) && !isLoading;

  const RANGER_TABS = [
    ["search",  "🔍 Search"],
    ["manage",  "🗂 Manage"],
    ["history", "🕓 History"],
  ];

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"var(--font-bricolage)" }}>

      {/* ── Ranger left panel — forest green header ── */}
      <div style={{
        width:"40%", display:"flex", flexDirection:"column", overflowY:"auto",
        background:"white",
      }}>
        {/* dark green top bar */}
        <div style={{
          background:"linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
          padding:"24px 32px 20px", color:"white",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase",
                opacity:.7, marginBottom:4, fontWeight:600 }}>
                🏕️ Park Ranger Portal
              </div>
              <h1 style={{ fontSize:"1.9rem", fontWeight:800, margin:0, letterSpacing:"-0.02em" }}>
                GatorGreen
              </h1>
              <div style={{ fontSize:13, opacity:.75, marginTop:3 }}>
                {profile?.name || user?.email?.split("@")[0]}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)",
                color:"white", padding:"7px 14px", borderRadius:8, fontSize:12,
                cursor:"pointer", fontWeight:600 }}
            >
              Sign Out
            </button>
          </div>
          {/* ranger stat chips */}
          <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
            {profile?.preferred_activities && (
              <span style={{ fontSize:11, background:"rgba(255,255,255,0.15)",
                padding:"3px 10px", borderRadius:20, opacity:.9 }}>
                {profile.preferred_activities.slice(0,30)}{profile.preferred_activities.length>30?"…":""}
              </span>
            )}
            {profile?.max_radius && (
              <span style={{ fontSize:11, background:"rgba(255,255,255,0.15)",
                padding:"3px 10px", borderRadius:20, opacity:.9 }}>
                📍 {profile.max_radius} mi range
              </span>
            )}
          </div>
        </div>

        {/* tabs */}
        <div style={{ display:"flex", borderBottom:"2px solid #e2e8f0", background:"white" }}>
          {RANGER_TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex:1, padding:"11px 0", border:"none", background:"none",
              fontWeight: tab===key ? 700 : 400, fontSize:13,
              cursor:"pointer", color: tab===key ? "#15803d" : "#94a3b8",
              borderBottom: tab===key ? "2px solid #15803d" : "2px solid transparent",
              marginBottom:-2, transition:"color .15s",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div style={{ padding:"20px 28px", display:"flex", flexDirection:"column",
          gap:14, flex:1 }}>

          {/* Search tab */}
          {tab === "search" && (
            <>
              <form onSubmit={handleFindSpaces} style={{
                background:"#f0fdf4", padding:"20px", borderRadius:"15px",
                border:"1px solid #dcfce7", display:"flex", flexDirection:"column", gap:"10px",
              }}>
                <h3 style={{ margin:"0 0 5px", fontSize:"1rem", color:"#14532d" }}>
                  Find Green Spaces
                </h3>
                <input placeholder="Location name (optional)" value={locationName}
                  onChange={(e) => setLocationName(e.target.value)} style={inputStyle} />
                <input placeholder="Address (e.g. 123 Main St, Gainesville FL)"
                  value={address} disabled={isLoading}
                  onChange={(e) => { setAddress(e.target.value); setLocError("");
                    if (e.target.value.trim()) { setLat(""); setLng(""); } }}
                  style={inputStyle} />
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, height:1, background:"#d1fae5" }} />
                  <span style={{ fontSize:12, color:"#86efac", fontWeight:600 }}>OR</span>
                  <div style={{ flex:1, height:1, background:"#d1fae5" }} />
                </div>
                <div style={{ display:"flex", gap:"10px" }}>
                  <input placeholder="Latitude" value={lat} disabled={isLoading}
                    onChange={(e) => { setLat(e.target.value); setLocError("");
                      if (e.target.value.trim()) setAddress(""); }}
                    style={inputStyle} />
                  <input placeholder="Longitude" value={lng} disabled={isLoading}
                    onChange={(e) => { setLng(e.target.value); setLocError("");
                      if (e.target.value.trim()) setAddress(""); }}
                    style={inputStyle} />
                </div>
                {locError && <p style={{ margin:0, fontSize:12, color:"#ef4444" }}>⚠ {locError}</p>}
                <button type="button" onClick={handleGetCurrentLocation}
                  disabled={isLocating || isLoading}
                  style={{ ...btnStyle, background:"white", color:"#16a34a",
                    border:"1px solid #16a34a", opacity:(isLocating||isLoading)?.6:1 }}>
                  {isLocating ? "Locating..." : "📍 Use Current Location"}
                </button>
                <button type="submit" disabled={!canSubmit}
                  style={{ ...btnStyle, opacity:canSubmit?1:.5,
                    cursor:canSubmit?"pointer":"not-allowed" }}>
                  {isLoading ? "Searching..." : "🌿 Find Green Spaces Near Me"}
                </button>
                {apiError && <p style={{ margin:0, fontSize:12, color:"#ef4444" }}>⚠ {apiError}</p>}
              </form>

              {isLoading && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[...Array(5)].map((_,i) => (
                    <div key={i} style={{ height:52, borderRadius:10, background:"#f0fdf4",
                      border:"1px solid #dcfce7",
                      animation:`pulse 1.6s ${i*.12}s ease-in-out infinite` }} />
                  ))}
                </div>
              )}

              {searched && !isLoading && spaces.length === 0 && !apiError && (
                <p style={{ fontSize:13, color:"#16a34a", opacity:.6, textAlign:"center" }}>
                  No spaces found. Try a different location.
                </p>
              )}

              {spaces.map((space, i) => (
                <div key={i} onClick={() => setActiveIdx(activeIdx===i?null:i)}
                  style={{ background:activeIdx===i?"#f0fdf4":"#f8fafc",
                    border:`1px solid ${activeIdx===i?"#86efac":"#e2e8f0"}`,
                    borderRadius:"10px", padding:"12px", fontSize:"14px",
                    cursor:"pointer", transition:"background .15s, border-color .15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", gap:8 }}>
                    <span style={{ fontWeight:600, color:"#14532d" }}>
                      {TYPE_EMOJI[space.type]||"📍"} {space.name}
                    </span>
                    <span style={{ fontSize:10, color:"#64748b", background:"#f1f5f9",
                      padding:"2px 7px", borderRadius:20, textTransform:"uppercase",
                      letterSpacing:".04em", fontWeight:600, flexShrink:0 }}>
                      {space.type?.replace("_"," ")}
                    </span>
                  </div>
                  {activeIdx === i && (
                    <>
                      {space.description && (
                        <p style={{ margin:"6px 0 4px", fontSize:12.5,
                          color:"#374151", lineHeight:1.55 }}>{space.description}</p>
                      )}
                      <div style={{ display:"flex", gap:12, marginTop:4 }}>
                        <span style={{ fontSize:11, color:"#94a3b8" }}>
                          {space.lat?.toFixed(4)}, {space.lng?.toFixed(4)}
                        </span>
                        {space.distance_miles != null && (
                          <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>
                            {space.distance_miles<1
                              ? `${(space.distance_miles*5280).toFixed(0)} ft away`
                              : `${space.distance_miles.toFixed(1)} mi away`}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Manage tab */}
          {tab === "manage" && (
            <ManageTab
              supabase={supabase}
              onMapUpdate={setMapLocations}
            />
          )}

          {/* History tab */}
          {tab === "history" && (
            <PastSearches
              searches={searches}
              onSelect={(locs) => setMapLocations(locs)}
            />
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ width:"60%", position:"relative" }}>
        <MapWithNoSSR locations={mapLocations} />
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.75} }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPLORER DASHBOARD  (original UI)
───────────────────────────────────────────────────────────── */
function ExplorerDashboard({ profile, user, supabase, router }) {
  const [tab,          setTab]          = useState("search");
  const [locationName, setLocationName] = useState(profile?.name || "");
  const [address,      setAddress]      = useState("");
  const [lat,          setLat]          = useState(profile?.lat  ? String(profile.lat)  : "");
  const [lng,          setLng]          = useState(profile?.long ? String(profile.long) : "");
  const [isLocating,   setIsLocating]   = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [locError,     setLocError]     = useState("");
  const [apiError,     setApiError]     = useState("");
  const [spaces,       setSpaces]       = useState([]);
  const [favorites,    setFavorites]    = useState(new Set());
  const [activeIdx,    setActiveIdx]    = useState(null);
  const [searched,     setSearched]     = useState(false);
  const [savingFav,    setSavingFav]    = useState(null);
  const [searches,     setSearches]     = useState(null);
  const [mapLocations, setMapLocations] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: favs } = await supabase.from("favorites")
        .select("space_id").eq("user_id", user.id);
      if (favs) setFavorites(new Set(favs.map((f) => f.space_id)));
      loadSearches();
    };
    init();
  }, []);

  const loadSearches = async () => {
    const { data } = await supabase.from("searches").select("*")
      .eq("user_id", user.id).order("created_at", { ascending:false }).limit(30);
    setSearches(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); router.push("/login");
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setIsLocating(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude.toFixed(6);
        const newLng = pos.coords.longitude.toFixed(6);
        setLat(newLat); setLng(newLng); setAddress(""); setIsLocating(false);
        await supabase.from("profiles")
          .update({ lat:parseFloat(newLat), long:parseFloat(newLng) }).eq("id", user.id);
      },
      () => { setLocError("Unable to retrieve location"); setIsLocating(false); }
    );
  };

  const handleFindSpaces = async (e) => {
    e.preventDefault();
    const hasCoords = lat && lng; const hasAddress = address.trim();
    if (!hasCoords && !hasAddress) { setLocError("Enter an address or use current location"); return; }
    setIsLoading(true); setApiError(""); setSpaces([]); setActiveIdx(null); setSearched(true);
    try {
      const res = await fetch("/api/find-spaces", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          name: locationName,
          ...(hasCoords ? { lat:parseFloat(lat), lng:parseFloat(lng) } : { address:hasAddress }),
          preferred_activities: profile?.preferred_activities ?? null,
          max_radius:           profile?.max_radius ?? 15,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      setSpaces(data.spaces);
      setMapLocations(data.spaces.map((s) => ({ name:s.name, lat:s.lat, lng:s.lng })));
      if (data.spaces.length > 0) {
        await supabase.from("green_spaces").upsert(
          data.spaces.map((s) => ({ name:s.name, slug:toSlug(s.name), type:s.type,
            lat:s.lat, long:s.lng, location:s.location??null, description:s.description??null })),
          { onConflict:"slug", ignoreDuplicates:true }
        );
        await supabase.from("searches").insert({
          user_id:user.id, location_name:locationName||null,
          address:hasAddress||null,
          lat: hasCoords ? parseFloat(lat) : null,
          long: hasCoords ? parseFloat(lng) : null,
          spaces: data.spaces,
        });
        loadSearches();
      }
    } catch (err) { setApiError(err.message); }
    finally { setIsLoading(false); }
  };

  const toggleFavorite = async (space, idx) => {
    if (!user) return;
    const { data: dbSpace } = await supabase.from("green_spaces")
      .select("id").eq("slug", toSlug(space.name)).maybeSingle();
    if (!dbSpace) return;
    const spaceId = dbSpace.id;
    setSavingFav(idx);
    if (favorites.has(spaceId)) {
      await supabase.from("favorites").delete().eq("user_id",user.id).eq("space_id",spaceId);
      setFavorites((prev) => { const s=new Set(prev); s.delete(spaceId); return s; });
    } else {
      await supabase.from("favorites").insert({ user_id:user.id, space_id:spaceId });
      setFavorites((prev) => new Set([...prev, spaceId]));
    }
    setSavingFav(null);
  };

  const canSubmit = !!((lat && lng) || address.trim()) && !isLoading;

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"var(--font-bricolage)" }}>
      <div style={{ width:"40%", background:"white", color:"#14532d", display:"flex",
        flexDirection:"column", padding:"40px", gap:"20px", overflowY:"auto" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 style={{ fontSize:"2.4rem", fontWeight:"750", margin:0 }}>Dashboard</h1>
            <h2 style={{ fontSize:"1.2rem", fontWeight:"400", margin:"4px 0 0", opacity:0.8 }}>
              Green Spaces Near You
            </h2>
          </div>
          <button onClick={handleLogout}
            style={{ ...btnStyle, background:"white", color:"#ef4444",
              border:"1px solid #fca5a5", fontSize:13, padding:"8px 14px",
              marginTop:4, whiteSpace:"nowrap" }}>
            Sign Out
          </button>
        </div>

        {profile && (
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
            fontSize:13, color:"#16a34a" }}>
            <span>👤 {profile.name || user?.email?.split("@")[0]}</span>
            {profile.preferred_activities && (
              <span style={{ opacity:.65 }}>
                · {profile.preferred_activities.slice(0,30)}
                {profile.preferred_activities.length>30?"…":""}
              </span>
            )}
            {profile.max_radius && <span style={{ opacity:.65 }}>· 📍 {profile.max_radius} mi</span>}
          </div>
        )}

        {/* tabs */}
        <div style={{ display:"flex", gap:0, borderBottom:"2px solid #e2e8f0" }}>
          {[["search","🔍 Search"],["history","🕓 Past Searches"]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex:1, padding:"10px 0", border:"none", background:"none",
              fontWeight:tab===key?700:400, fontSize:14, cursor:"pointer",
              color:tab===key?"#15803d":"#94a3b8",
              borderBottom:tab===key?"2px solid #16a34a":"2px solid transparent",
              marginBottom:-2, transition:"color .15s",
            }}>{label}</button>
          ))}
        </div>

        {tab === "search" && (
          <>
            <form onSubmit={handleFindSpaces} style={{ background:"#f0fdf4", padding:"20px",
              borderRadius:"15px", border:"1px solid #dcfce7",
              display:"flex", flexDirection:"column", gap:"10px" }}>
              <h3 style={{ margin:"0 0 5px", fontSize:"1rem" }}>Find Green Spaces</h3>
              <input placeholder="Location name (optional)" value={locationName}
                onChange={(e) => setLocationName(e.target.value)} style={inputStyle} />
              <input placeholder="Address (e.g. 123 Main St, Gainesville FL)"
                value={address} disabled={isLoading}
                onChange={(e) => { setAddress(e.target.value); setLocError("");
                  if (e.target.value.trim()) { setLat(""); setLng(""); } }}
                style={inputStyle} />
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ flex:1, height:1, background:"#d1fae5" }} />
                <span style={{ fontSize:12, color:"#86efac", fontWeight:600 }}>OR</span>
                <div style={{ flex:1, height:1, background:"#d1fae5" }} />
              </div>
              <div style={{ display:"flex", gap:"10px" }}>
                <input placeholder="Latitude" value={lat} disabled={isLoading}
                  onChange={(e) => { setLat(e.target.value); setLocError("");
                    if (e.target.value.trim()) setAddress(""); }} style={inputStyle} />
                <input placeholder="Longitude" value={lng} disabled={isLoading}
                  onChange={(e) => { setLng(e.target.value); setLocError("");
                    if (e.target.value.trim()) setAddress(""); }} style={inputStyle} />
              </div>
              {locError && <p style={{ margin:0, fontSize:12, color:"#ef4444" }}>⚠ {locError}</p>}
              <button type="button" onClick={handleGetCurrentLocation}
                disabled={isLocating||isLoading}
                style={{ ...btnStyle, background:"white", color:"#16a34a",
                  border:"1px solid #16a34a", opacity:(isLocating||isLoading)?.6:1 }}>
                {isLocating ? "Locating..." : "📍 Use Current Location"}
              </button>
              <button type="submit" disabled={!canSubmit}
                style={{ ...btnStyle, opacity:canSubmit?1:.5,
                  cursor:canSubmit?"pointer":"not-allowed" }}>
                {isLoading ? "Searching..." : "🌿 Find Green Spaces Near Me"}
              </button>
              {apiError && <p style={{ margin:0, fontSize:12, color:"#ef4444" }}>⚠ {apiError}</p>}
            </form>

            {isLoading && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...Array(5)].map((_,i) => (
                  <div key={i} style={{ height:52, borderRadius:10, background:"#f0fdf4",
                    border:"1px solid #dcfce7",
                    animation:`pulse 1.6s ${i*.12}s ease-in-out infinite` }} />
                ))}
              </div>
            )}

            {searched && !isLoading && spaces.length===0 && !apiError && (
              <p style={{ fontSize:13, color:"#16a34a", opacity:.6, textAlign:"center" }}>
                No spaces found. Try a different location.
              </p>
            )}

            {spaces.map((space, i) => (
              <div key={i} onClick={() => setActiveIdx(activeIdx===i?null:i)}
                style={{ background:activeIdx===i?"#f0fdf4":"#f8fafc",
                  border:`1px solid ${activeIdx===i?"#86efac":"#e2e8f0"}`,
                  borderRadius:"10px", padding:"12px", fontSize:"14px",
                  cursor:"pointer", transition:"background .15s, border-color .15s" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", gap:8 }}>
                  <span style={{ fontWeight:600, color:"#14532d" }}>
                    {TYPE_EMOJI[space.type]||"📍"} {space.name}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                    {user && (
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(space,i); }}
                        disabled={savingFav===i}
                        style={{ background:"none", border:"none", cursor:"pointer",
                          fontSize:15, padding:"2px 4px", opacity:savingFav===i?.5:1 }}>
                        🤍
                      </button>
                    )}
                    <span style={{ fontSize:10, color:"#64748b", background:"#f1f5f9",
                      padding:"2px 7px", borderRadius:20, textTransform:"uppercase",
                      letterSpacing:".04em", fontWeight:600 }}>
                      {space.type?.replace("_"," ")}
                    </span>
                  </div>
                </div>
                {activeIdx===i && (
                  <>
                    {space.description && (
                      <p style={{ margin:"6px 0 4px", fontSize:12.5,
                        color:"#374151", lineHeight:1.55 }}>{space.description}</p>
                    )}
                    <div style={{ display:"flex", gap:12, marginTop:4 }}>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>
                        {space.lat?.toFixed(4)}, {space.lng?.toFixed(4)}
                      </span>
                      {space.distance_miles!=null && (
                        <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>
                          {space.distance_miles<1
                            ? `${(space.distance_miles*5280).toFixed(0)} ft away`
                            : `${space.distance_miles.toFixed(1)} mi away`}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {tab === "history" && (
          <PastSearches searches={searches} onSelect={(locs) => setMapLocations(locs)} />
        )}
      </div>

      <div style={{ width:"60%", position:"relative" }}>
        <MapWithNoSSR locations={mapLocations} />
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.75} }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT: load profile, then render correct dashboard
───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const supabase = createClient();
  const router   = useRouter();
  const [profile, setProfile] = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUser(user);
      const { data: prof } = await supabase.from("profiles")
        .select("*").eq("id", user.id).maybeSingle();
      setProfile(prof || {});
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div style={{ display:"flex", height:"100vh", alignItems:"center",
      justifyContent:"center", background:"white" }}>
      <div style={{ width:32, height:32, border:"3px solid #dcfce7",
        borderTop:"3px solid #16a34a", borderRadius:"50%",
        animation:"spin 0.9s linear infinite" }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  const isRanger = profile?.role === "park_ranger";

  return isRanger
    ? <RangerDashboard profile={profile} user={user} supabase={supabase} router={router} />
    : <ExplorerDashboard profile={profile} user={user} supabase={supabase} router={router} />;
}