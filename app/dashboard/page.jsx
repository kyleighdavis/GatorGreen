"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pin = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";

const pinIcon = L.icon({
  iconUrl: pin,
  iconSize: [24, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

export default function Dashboard() {
  const [locations, setLocations] = useState([
    {name: "Devil's Millhopper Geological State Park", lat: 29.70441996601247, lng: -82.39372817116435},
    {name: "Bivens Arm Nature Park", lat: 29.620294404550684, lng: -82.33334806376804},
    {name: "Kanapaha Botanical Gardens", lat: 29.61234934634606, lng: -82.40894962883559},
  ]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "var(--font-bricolage)" }}>

      {/* Left side - List of nearby locations */}
      <div style={{
        width: "40%",
        background: "white",
        color: "#14532d",
        display: "flex",
        flexDirection: "column",
        //justifyContent: "center",
        padding: "48px 40px",
        gap: "16px",
      }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: "750", lineHeight: 1.15, margin: 0, marginTop: "0" }}>
          Dashboard
        </h1>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "400", lineHeight: 1.15, margin: 0, marginTop: "0", fontFamily: "var(--font-bricolage)"}}>
          Green Spaces Near You
        </h2>

        {/* Search bar - this is not functional right now :( */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text"
            placeholder="Edit location..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(20,83,45,0.2)",
              background: "rgba(20,83,45,0.05)",
              color: "#14532d",
              fontSize: "14px",
              fontFamily: "var(--font-dm)",
              outline: "none",
            }}
          />
          <button style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: "#305127",
            color: "white",
            fontFamily: "var(--font-dm)",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
          }}>
            Search
          </button>
        </div>

        {/* List of locations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {locations.map(({ name }) => (
            <div key={name} style={{
              background: "#bdf2c734",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              ◯ {name}
            </div>
          ))}
        </div>

      </div> {/* end left panel */}

      {/* Right side = map! */}
      <div style={{ width: "60%", position: "relative" }}>
        <MapContainer
          center={[29.6448983, -82.3553288]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='© OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(({ name, lat, lng }) => (
            <Marker key={name} position={[lat, lng]} icon={pinIcon}>
              <Popup>{name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}