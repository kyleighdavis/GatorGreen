"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "leaflet/dist/leaflet.css";
import { Star } from "lucide-react";

const DashboardMap = dynamic(() => import("@/components/MapComponent"), { ssr: false });

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TYPE_OPTIONS = ["park", "garden", "trail", "wetland", "nature_preserve", "greenway"];
const TYPE_EMOJI = {
  park: "", garden: "", trail: "",
  wetland: "", nature_preserve: "", greenway: "",
};

const inputStyle = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(20,83,45,0.2)",
  background: "rgba(20,83,45,0.05)",
  color: "#14532d",
  fontSize: "14px",
  fontFamily: "var(--font-dm)",
  outline: "none",
};

const btnStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#305127",
  color: "white",
  fontFamily: "var(--font-dm)",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
};

const cardStyle = {
  background: "#bdf2c734",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

function PastSearches({ searches, onSelect }) {
  const [openIdx, setOpenIdx] = useState(null);

  if (searches === null) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ ...cardStyle, opacity: .4,
          animation: `pulse 1.5s ${i * .15}s ease-in-out infinite` }}>&nbsp;</div>
      ))}
    </div>
  );

  if (!searches.length) return (
    <div style={{ ...cardStyle, color: "#64748b", fontSize: 13 }}>
      No past searches yet.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {searches.map((search, i) => {
        const spaces = search.spaces || [];
        const isOpen = openIdx === i;
        const label  = search.location_name || search.address
          || (search.lat ? `${parseFloat(search.lat).toFixed(3)}, ${parseFloat(search.long).toFixed(3)}` : "Unknown");
        const date   = new Date(search.created_at).toLocaleDateString("en-US",
          { month: "short", day: "numeric", year: "numeric" });
        return (
          <div key={search.id} style={{ borderRadius: "10px", overflow: "hidden" }}>
            <div
              onClick={() => { setOpenIdx(isOpen ? null : i); onSelect(spaces.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng }))); }}
              style={{ ...cardStyle, cursor: "pointer", justifyContent: "space-between",
                background: isOpen ? "rgba(20,83,45,0.12)" : "#bdf2c734" }}
            >
              <span>◯ {label}</span>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "var(--font-dm)" }}>
                {date} · {spaces.length} found {isOpen ? "▲" : "▼"}
              </span>
            </div>
            {isOpen && spaces.map((space, j) => (
              <div key={j} style={{ ...cardStyle, borderRadius: 0, paddingLeft: 28,
                background: "rgba(20,83,45,0.04)",
                borderTop: "1px solid rgba(20,83,45,0.08)",
                flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <span>{TYPE_EMOJI[space.type] || "◯"} {space.name}</span>
                {space.description && (
                  <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4,
                    fontFamily: "var(--font-dm)" }}>
                    {space.description}
                  </span>
                )}
                {space.distance_miles != null && (
                  <span style={{ fontSize: 11, color: "#305127", fontWeight: 600,
                    fontFamily: "var(--font-dm)" }}>
                    {space.distance_miles < 1
                      ? `${(space.distance_miles * 5280).toFixed(0)} ft`
                      : `${space.distance_miles.toFixed(1)} mi`}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SpaceForm({ initial = {}, onSave, onCancel, saving }) {
  const [name,        setName]        = useState(initial.name        || "");
  const [type,        setType]        = useState(initial.type        || "park");
  const [location,    setLocation]    = useState(initial.location    || "");
  const [lat,         setLat]         = useState(initial.lat  != null ? String(initial.lat)  : "");
  const [lng,         setLng]         = useState(initial.long != null ? String(initial.long) : "");
  const [description, setDescription] = useState(initial.description || "");
  const isEdit  = !!initial.id;
  const canSave = name.trim() && lat && lng && type && location.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#14532d",
        fontFamily: "var(--font-dm)" }}>
        {isEdit ? "Edit Space" : "Add New Space"}
      </span>
      <input placeholder="Name *" value={name}
        onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, flex: "unset", width: "100%", boxSizing: "border-box" }} />
      <input placeholder="Location * (e.g. Gainesville, FL)" value={location}
        onChange={(e) => setLocation(e.target.value)} style={{ ...inputStyle, flex: "unset", width: "100%", boxSizing: "border-box" }} />
      <select value={type} onChange={(e) => setType(e.target.value)}
        style={{ ...inputStyle, flex: "unset", width: "100%", boxSizing: "border-box", cursor: "pointer" }}>
        {TYPE_OPTIONS.map((t) => (
          <option key={t} value={t}>{TYPE_EMOJI[t]} {t.replace("_", " ")}</option>
        ))}
      </select>
      <div style={{ display: "flex", gap: "8px" }}>
        <input placeholder="Latitude *" value={lat}
          onChange={(e) => setLat(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <input placeholder="Longitude *" value={lng}
          onChange={(e) => setLng(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
      </div>
      <textarea placeholder="Description" value={description}
        onChange={(e) => setDescription(e.target.value)} rows={2}
        style={{ ...inputStyle, flex: "unset", width: "100%", boxSizing: "border-box",
          resize: "vertical", fontFamily: "var(--font-dm)" }} />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onSave({ name, type, location, lat: parseFloat(lat), long: parseFloat(lng),
            description, slug: toSlug(name), ...(isEdit ? { id: initial.id } : {}) })}
          disabled={!canSave || saving}
          style={{ ...btnStyle, flex: 2, opacity: canSave && !saving ? 1 : .5,
            cursor: canSave && !saving ? "pointer" : "not-allowed" }}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add to Map"}
        </button>
        <button onClick={onCancel}
          style={{ ...btnStyle, flex: 1, background: "rgba(20,83,45,0.1)", color: "#14532d" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ManageTab({ supabase, onMapUpdate }) {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState(null);
  const [searching, setSearching] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setResults(null); setMsg(""); setShowAdd(false); setEditingId(null);
    const { data } = await supabase.from("green_spaces").select("*")
      .or(`location.ilike.%${query.trim()}%,name.ilike.%${query.trim()}%`).order("name");
    setResults(data || []);
    setSearching(false);
    onMapUpdate((data || []).map((s) => ({ name: s.name, lat: s.lat, lng: s.long })));
  };

  const handleSave = async (space) => {
    setSaving(true); setMsg("");
    if (space.id) {
      const { error } = await supabase.from("green_spaces")
        .update({ name: space.name, slug: space.slug, type: space.type,
          lat: space.lat, long: space.long, location: space.location, description: space.description })
        .eq("id", space.id);
      if (error) setMsg("Error: " + error.message);
      else { setMsg("Updated"); setEditingId(null); handleSearch(); }
    } else {
      const { error } = await supabase.from("green_spaces")
        .upsert({ ...space }, { onConflict: "slug" });
      if (error) setMsg("Error: " + error.message);
      else { setMsg("Added"); setShowAdd(false); handleSearch(); }
    }
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input type="text"
          placeholder="Search by location (e.g. Gainesville, FL)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={inputStyle}
        />
        <button onClick={handleSearch} disabled={searching || !query.trim()}
          style={{ ...btnStyle, opacity: query.trim() ? 1 : .5 }}>
          {searching ? "..." : "Search"}
        </button>
      </div>

      {msg && (
        <div style={{ ...cardStyle, fontSize: 13,
          background: msg.startsWith("Error:") ? "rgba(239,68,68,0.08)" : "#bdf2c734",
          color: msg.startsWith("Error:") ? "#ef4444" : "#305127" }}>
          {msg}
        </div>
      )}

      {results !== null && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#14532d", opacity: .6, fontFamily: "var(--font-dm)" }}>
              {results.length} space{results.length !== 1 ? "s" : ""} found
            </span>
            {!showAdd && (
              <button onClick={() => { setShowAdd(true); setEditingId(null); }}
                style={{ ...btnStyle, padding: "7px 14px", fontSize: 13 }}>
                + Add New Space
              </button>
            )}
          </div>

          {showAdd && (
            <SpaceForm onSave={handleSave} onCancel={() => setShowAdd(false)} saving={saving} />
          )}

          {results.length === 0 && !showAdd && (
            <div style={{ ...cardStyle, color: "#64748b", fontSize: 13 }}>
              No spaces found. Use &quot;+ Add New Space&quot; to create one.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {results.map((space) => (
              <div key={space.id}>
                {editingId === space.id ? (
                  <SpaceForm initial={space} onSave={handleSave}
                    onCancel={() => setEditingId(null)} saving={saving} />
                ) : (
                  <div style={{ ...cardStyle, justifyContent: "space-between",
                    alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span>{TYPE_EMOJI[space.type] || "◯"} {space.name}</span>
                      <span style={{ fontSize: 12, color: "#64748b", fontFamily: "var(--font-dm)" }}>
                        {space.location && `${space.location}  ·  `}
                        {parseFloat(space.lat).toFixed(4)}, {parseFloat(space.long).toFixed(4)}
                      </span>
                      {space.description && (
                        <span style={{ fontSize: 12, color: "#64748b",
                          fontFamily: "var(--font-dm)", lineHeight: 1.4 }}>
                          {space.description}
                        </span>
                      )}
                    </div>
                    <button onClick={() => { setEditingId(space.id); setShowAdd(false); }}
                      style={{ ...btnStyle, padding: "5px 12px", fontSize: 12, flexShrink: 0,
                        background: "rgba(20,83,45,0.1)", color: "#14532d", marginLeft: 8 }}>
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const supabase = createClient();
  const router   = useRouter();

  const [profile,   setProfile]   = useState(null);
  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [address,   setAddress]   = useState("");
  const [lat,       setLat]       = useState("");
  const [lng,       setLng]       = useState("");
  const [locName,   setLocName]   = useState("");

  const [isLocating, setIsLocating] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [locError,   setLocError]   = useState("");
  const [apiError,   setApiError]   = useState("");
  const [locations,  setLocations]  = useState([
    { name: "Devil's Millhopper Geological State Park", lat: 29.70441996601247, lng: -82.39372817116435 },
    { name: "Bivens Arm Nature Park",                   lat: 29.620294404550684, lng: -82.33334806376804 },
    { name: "Kanapaha Botanical Gardens",               lat: 29.61234934634606,  lng: -82.40894962883559 },
  ]);
  const [resultSpaces, setResultSpaces] = useState([]);
  const [activeIdx,    setActiveIdx]    = useState(null);
  const [favorites,    setFavorites]    = useState(new Set());
  const [savingFav,    setSavingFav]    = useState(null);
  const [searches,       setSearches]       = useState(null);
  const [favoriteSpaces, setFavoriteSpaces] = useState(null);
  const [searched,       setSearched]       = useState(false);
  const [tab,            setTab]            = useState("search");
  const [recommendations, setRecommendations] = useState(null);
  const [recsUpdatedAt,  setRecsUpdatedAt]  = useState(null);
  const [recsLoading,    setRecsLoading]    = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUser(user);
      const { data: prof } = await supabase.from("profiles")
        .select("*").eq("id", user.id).maybeSingle();
      if (prof) {
        setProfile(prof);
        if (prof.name) setLocName(prof.name);
        if (prof.lat)  setLat(String(prof.lat));
        if (prof.long) setLng(String(prof.long));
      }
      const { data: favs } = await supabase
        .from("favorites")
        .select("space_id, green_spaces(slug)")
        .eq("user_id", user.id);
      if (favs) setFavorites(new Set(favs.map((f) => f.green_spaces?.slug).filter(Boolean)));
      await loadSearches(user.id);
      loadFavorites(user.id);
      const { data: cached } = await supabase
        .from("recommendations").select("*").eq("user_id", user.id).maybeSingle();
      if (cached?.spaces?.length) {
        setRecommendations(cached.spaces);
        setRecsUpdatedAt(cached.created_at);
      } else {
        setRecommendations([]);
      }
      setAuthReady(true);
    };
    init();
  }, []);

  const loadFavorites = async (uid) => {
    const { data } = await supabase
      .from("favorites")
      .select("space_id, green_spaces(*)")
      .eq("user_id", uid);
    setFavoriteSpaces((data || []).map((f) => f.green_spaces).filter(Boolean));
  };

  const loadSearches = async (uid) => {
    const { data } = await supabase.from("searches").select("*")
      .eq("user_id", uid).order("created_at", { ascending: false }).limit(30);
    setSearches(data || []);
    return data || [];
  };

  const generateRecommendations = async () => {
    if (!user || !searches || searches.length < 2) return;
    setRecsLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searches: searches.slice(0, 3), profile, previousSpaces: recommendations || [] }),
      });
      const data = await res.json();
      if (res.ok && data.spaces) {
        const now = new Date().toISOString();
        setRecommendations(data.spaces);
        setRecsUpdatedAt(now);
        await supabase.from("recommendations")
          .upsert({ user_id: user.id, spaces: data.spaces, created_at: now }, { onConflict: "user_id" });
      }
    } catch { /* silent — keep showing last results */ }
    setRecsLoading(false);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setIsLocating(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude.toFixed(6);
        const newLng = pos.coords.longitude.toFixed(6);
        setLat(newLat); setLng(newLng); setAddress(""); setIsLocating(false);
        if (user) await supabase.from("profiles")
          .update({ lat: parseFloat(newLat), long: parseFloat(newLng) }).eq("id", user.id);
      },
      () => { setLocError("Unable to retrieve location"); setIsLocating(false); }
    );
  };

  const handleSearch = async () => {
    const hasCoords  = lat && lng;
    const hasAddress = address.trim();
    if (!hasCoords && !hasAddress) { setLocError("Enter an address or use current location"); return; }
    setIsLoading(true); setApiError(""); setResultSpaces([]);
    setActiveIdx(null); setSearched(true); setLocError("");

    try {
      const res = await fetch("/api/find-spaces", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locName,
          ...(hasCoords ? { lat: parseFloat(lat), lng: parseFloat(lng) } : { address: hasAddress }),
          preferred_activities: profile?.preferred_activities ?? null,
          max_radius:           profile?.max_radius ?? 15,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");

      setResultSpaces(data.spaces);
      setLocations(data.spaces.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng })));

      if (user && data.spaces.length > 0) {
        await supabase.from("green_spaces").upsert(
          data.spaces.map((s) => ({ name: s.name, slug: toSlug(s.name), type: s.type,
            lat: s.lat, long: s.lng, location: s.location ?? null, description: s.description ?? null })),
          { onConflict: "slug", ignoreDuplicates: true }
        );
        await supabase.from("searches").insert({
          user_id: user.id, location_name: locName || null, address: hasAddress || null,
          lat: hasCoords ? parseFloat(lat) : null, long: hasCoords ? parseFloat(lng) : null,
          spaces: data.spaces,
        });
        await loadSearches(user.id);
      }
    } catch (err) { setApiError(err.message || "Something went wrong."); }
    finally { setIsLoading(false); }
  };

  const toggleFavorite = async (space, idx) => {
    if (!user) return;
    const slug = toSlug(space.name);
    const isFav = favorites.has(slug);

    // Optimistic update — star flips instantly
    setFavorites((prev) => { const s = new Set(prev); isFav ? s.delete(slug) : s.add(slug); return s; });
    setFavoriteSpaces((prev) =>
      isFav
        ? (prev || []).filter((s) => toSlug(s.name) !== slug)
        : [...(prev || []), { ...space, long: space.lng ?? space.long }]
    );

    // DB write in background
    const { data: dbSpace } = await supabase.from("green_spaces")
      .select("id").eq("slug", slug).maybeSingle();
    if (!dbSpace) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("space_id", dbSpace.id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, space_id: dbSpace.id });
    }
  };

  const isRanger = profile?.role === "park_ranger";
  const tabs     = isRanger
    ? [["search", "Search"], ["for-you", "For You"], ["manage", "Manage"], ["favorites", "Favorites"], ["history", "History"]]
    : [["search", "Search"], ["for-you", "For You"], ["favorites", "Favorites"], ["history", "Past Searches"]];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "var(--font-bricolage)" }}>
      <div style={{
        width: "40%",
        background: "white",
        color: "#14532d",
        display: "flex",
        flexDirection: "column",
        padding: "48px 40px",
        gap: "16px",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "2.4rem", fontWeight: "750", lineHeight: 1.15, margin: 0, marginTop: "0" }}>
              Dashboard
            </h1>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "400", lineHeight: 1.15, margin: 0, marginTop: "0", fontFamily: "var(--font-bricolage)" }}>
              Green Spaces Near You
            </h2>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
            style={{ ...btnStyle, background: "rgba(239,68,68,0.08)", color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.25)", fontSize: 12,
              padding: "7px 13px", marginTop: 4, whiteSpace: "nowrap" }}
          >
            Sign Out
          </button>
        </div>
        {profile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#14532d", opacity: .6, fontFamily: "var(--font-dm)" }}>
              {profile.name || user?.email?.split("@")[0]}
              {profile.preferred_activities && ` · ${profile.preferred_activities.slice(0, 30)}${profile.preferred_activities.length > 30 ? "…" : ""}`}
              {profile.max_radius && ` · ${profile.max_radius} mi`}
            </p>
          <button
            onClick={() => router.push("/onboarding")}
           style={{ ...btnStyle, marginLeft: "auto", padding: "4px 10px", fontSize: 11,
            background: "#f5f5f0", color: "#14532d", border: "1px solid rgba(20,83,45,0.2)" }}
          ><b>Edit Preferences</b>
          </button></div>
        )}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(20,83,45,0.15)",
          marginBottom: -4 }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "8px 0", border: "none", background: "none",
              fontFamily: "var(--font-dm)", fontSize: 13, cursor: "pointer",
              color: tab === key ? "#305127" : "rgba(20,83,45,0.4)",
              fontWeight: tab === key ? 700 : 400,
              borderBottom: tab === key ? "2px solid #305127" : "2px solid transparent",
              marginBottom: -1, transition: "color .15s",
            }}>
              {label}
            </button>
          ))}
        </div>
        {tab === "search" && (
          <>
            <input
              type="text"
              placeholder="Location name (optional)"
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              style={{ ...inputStyle, flex: "unset", width: "100%", boxSizing: "border-box" }}
            />
            <input
              type="text"
              placeholder="Address (e.g. 123 Main St, Gainesville FL)"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value); setLocError("");
                if (e.target.value.trim()) { setLat(""); setLng(""); }
              }}
              disabled={isLoading}
              style={{ ...inputStyle, flex: "unset", width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(20,83,45,0.15)" }} />
              <span style={{ fontSize: 12, color: "rgba(20,83,45,0.35)",
                fontFamily: "var(--font-dm)", fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(20,83,45,0.15)" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => { setLat(e.target.value); setLocError(""); if (e.target.value.trim()) setAddress(""); }}
                disabled={isLoading}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Longitude"
                value={lng}
                onChange={(e) => { setLng(e.target.value); setLocError(""); if (e.target.value.trim()) setAddress(""); }}
                disabled={isLoading}
                style={inputStyle}
              />
            </div>
            {locError && (
              <p style={{ margin: 0, fontSize: 12, color: "#ef4444", fontFamily: "var(--font-dm)" }}>
                {locError}
              </p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleGetCurrentLocation}
                disabled={isLocating || isLoading}
                style={{ ...btnStyle, flex: 1, background: "rgba(20,83,45,0.08)",
                  color: "#14532d", border: "1px solid rgba(20,83,45,0.2)",
                  opacity: (isLocating || isLoading) ? .6 : 1 }}
              >
                {isLocating ? "Locating..." : "Use Current Location"}
              </button>
              <button
                onClick={handleSearch}
                disabled={isLoading || (!lat && !lng && !address.trim())}
                style={{ ...btnStyle, flex: 1,
                  opacity: (!lat && !lng && !address.trim()) || isLoading ? .5 : 1 }}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
            {apiError && (
              <p style={{ margin: 0, fontSize: 12, color: "#ef4444", fontFamily: "var(--font-dm)" }}>
                {apiError}
              </p>
            )}
            {isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ ...cardStyle, opacity: .4,
                    animation: `pulse 1.6s ${i * .12}s ease-in-out infinite` }}>&nbsp;</div>
                ))}
              </div>
            )}
            {searched && !isLoading && resultSpaces.length === 0 && !apiError && (
              <div style={{ ...cardStyle, color: "#64748b", fontSize: 13 }}>
                No spaces found. Try a different location.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              {resultSpaces.map((space, i) => (
                <div
                  key={i}
                  onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  style={{
                    ...cardStyle,
                    cursor: "pointer",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: activeIdx === i ? 6 : 0,
                    background: activeIdx === i ? "rgba(20,83,45,0.10)" : "#bdf2c734",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between",
                    width: "100%", alignItems: "center" }}>
                    <span>◯ {TYPE_EMOJI[space.type] || ""} {space.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {user && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(space, i); }}
                          disabled={savingFav === i}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            padding: 0, opacity: savingFav === i ? .5 : 1,
                            display: "flex", alignItems: "center" }}
                        >
                          <Star
                            size={16}
                            color="#305127"
                            fill={favorites.has(toSlug(space.name)) ? "#305127" : "none"}
                          />
                        </button>
                      )}
                      <span style={{ fontSize: 10, color: "#305127",
                        background: "rgba(20,83,45,0.08)", padding: "2px 7px",
                        borderRadius: 20, textTransform: "uppercase",
                        letterSpacing: ".04em", fontWeight: 600,
                        fontFamily: "var(--font-dm)" }}>
                        {space.type?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  {activeIdx === i && (
                    <div style={{ paddingLeft: 16, display: "flex",
                      flexDirection: "column", gap: 3 }}>
                      {space.description && (
                        <span style={{ fontSize: 12.5, color: "#374151",
                          fontFamily: "var(--font-dm)", lineHeight: 1.5 }}>
                          {space.description}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#64748b", fontFamily: "var(--font-dm)" }}>
                        {space.lat?.toFixed(4)}, {space.lng?.toFixed(4)}
                        {space.distance_miles != null && (
                          <span style={{ color: "#305127", fontWeight: 600, marginLeft: 8 }}>
                            {space.distance_miles < 1
                              ? `${(space.distance_miles * 5280).toFixed(0)} ft away`
                              : `${space.distance_miles.toFixed(1)} mi away`}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "for-you" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(20,83,45,0.45)",
                fontFamily: "var(--font-dm)" }}>
                {recsUpdatedAt
                  ? (() => {
                      const d = new Date(recsUpdatedAt);
                      const dd = String(d.getDate()).padStart(2, "0");
                      const mm = String(d.getMonth() + 1).padStart(2, "0");
                      const yyyy = d.getFullYear();
                      const hh = String(d.getHours()).padStart(2, "0");
                      const min = String(d.getMinutes()).padStart(2, "0");
                      return `Last updated ${dd}/${mm}/${yyyy} at ${hh}:${min}`;
                    })()
                  : "AI-picked spaces based on your search history"}
              </p>
              <button
                onClick={generateRecommendations}
                disabled={recsLoading || !searches || searches.length < 2}
                style={{ ...btnStyle, padding: "7px 14px", fontSize: 12,
                  opacity: (recsLoading || !searches || searches.length < 2) ? .5 : 1,
                  cursor: (recsLoading || !searches || searches.length < 2) ? "not-allowed" : "pointer" }}
              >
                {recsLoading ? "Generating..." : recommendations?.length ? "Update" : "Generate"}
              </button>
            </div>
            {recsLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ ...cardStyle, opacity: .4,
                    animation: `pulse 1.5s ${i * .15}s ease-in-out infinite` }}>&nbsp;</div>
                ))}
              </div>
            )}
            {!recsLoading && (!recommendations || recommendations.length === 0) && (
              <div style={{ ...cardStyle, color: "#64748b", fontSize: 13 }}>
                Make 2 or more searches to unlock personalized recommendations.
              </div>
            )}
            {!recsLoading && (recommendations || []).map((space, i) => (
              <div
                key={i}
                onClick={() => setLocations([{ name: space.name, lat: space.lat, lng: space.lng }])}
                style={{ ...cardStyle, cursor: "pointer", flexDirection: "column",
                  alignItems: "flex-start", gap: 4 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between",
                  width: "100%", alignItems: "center" }}>
                  <span>{TYPE_EMOJI[space.type] || "◯"} {space.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {user && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(space, i); }}
                        disabled={savingFav === i}
                        style={{ background: "none", border: "none", cursor: "pointer",
                          padding: 0, opacity: savingFav === i ? .5 : 1,
                          display: "flex", alignItems: "center" }}
                      >
                        <Star
                          size={16}
                          color="#305127"
                          fill={favorites.has(toSlug(space.name)) ? "#305127" : "none"}
                        />
                      </button>
                    )}
                    <span style={{ fontSize: 10, color: "#305127",
                      background: "rgba(20,83,45,0.08)", padding: "2px 7px",
                      borderRadius: 20, textTransform: "uppercase",
                      letterSpacing: ".04em", fontWeight: 600,
                      fontFamily: "var(--font-dm)" }}>
                      {space.type?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {space.description && (
                  <span style={{ fontSize: 12.5, color: "#374151", paddingLeft: 8,
                    fontFamily: "var(--font-dm)", lineHeight: 1.5 }}>
                    {space.description}
                  </span>
                )}
                {(space.location || space.distance_miles != null) && (
                  <span style={{ fontSize: 11, color: "#64748b", paddingLeft: 8,
                    fontFamily: "var(--font-dm)" }}>
                    {space.location}
                    {space.distance_miles != null && (
                      <span style={{ color: "#305127", fontWeight: 600, marginLeft: 6 }}>
                        {space.distance_miles < 1
                          ? `${(space.distance_miles * 5280).toFixed(0)} ft away`
                          : `${space.distance_miles.toFixed(1)} mi away`}
                      </span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {tab === "manage" && (
          <ManageTab
            supabase={supabase}
            onMapUpdate={(locs) => setLocations(locs)}
          />
        )}
        {tab === "favorites" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {favoriteSpaces === null && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ ...cardStyle, opacity: .4,
                    animation: `pulse 1.5s ${i * .15}s ease-in-out infinite` }}>&nbsp;</div>
                ))}
              </div>
            )}
            {favoriteSpaces !== null && favoriteSpaces.length === 0 && (
              <div style={{ ...cardStyle, color: "#64748b", fontSize: 13 }}>
                No favorites yet. Star a space to save it here!
              </div>
            )}
            {(favoriteSpaces || []).map((space, i) => (
              <div
                key={space.id || toSlug(space.name)}
                onClick={() => setLocations([{ name: space.name, lat: space.lat, lng: space.long }])}
                style={{ ...cardStyle, cursor: "pointer", flexDirection: "column",
                  alignItems: "flex-start", gap: 4 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between",
                  width: "100%", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(space, i); }}
                      style={{ background: "none", border: "none", cursor: "pointer",
                        padding: 0, display: "flex", alignItems: "center" }}
                    >
                      <Star size={16} color="#305127" fill="#305127" />
                    </button>
                    <span>{TYPE_EMOJI[space.type] || ""} {space.name}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#305127",
                    background: "rgba(20,83,45,0.08)", padding: "2px 7px",
                    borderRadius: 20, textTransform: "uppercase",
                    letterSpacing: ".04em", fontWeight: 600,
                    fontFamily: "var(--font-dm)" }}>
                    {space.type?.replace("_", " ")}
                  </span>
                </div>
                {space.description && (
                  <span style={{ fontSize: 12.5, color: "#374151", paddingLeft: 16,
                    fontFamily: "var(--font-dm)", lineHeight: 1.5 }}>
                    {space.description}
                  </span>
                )}
                {space.location && (
                  <span style={{ fontSize: 11, color: "#64748b", paddingLeft: 16,
                    fontFamily: "var(--font-dm)" }}>
                    {space.location}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {tab === "history" && (
          <PastSearches
            searches={searches}
            onSelect={(locs) => setLocations(locs)}
          />
        )}
      </div>
      <div style={{ width: "60%", position: "relative" }}>
        <DashboardMap locations={locations} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.75} }`}</style>
    </div>
  );
}