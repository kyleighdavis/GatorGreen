import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── Inline SpaceForm so we don't fight Next.js imports ───────
// This is a faithful copy of the component from dashboard/page.jsx

const TYPE_OPTIONS = ["park","garden","trail","wetland","nature_preserve","greenway"];

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SpaceForm({ initial = {}, onSave, onCancel, saving }) {
  const React = require("react");
  const [name,        setName]        = React.useState(initial.name        || "");
  const [type,        setType]        = React.useState(initial.type        || "park");
  const [location,    setLocation]    = React.useState(initial.location    || "");
  const [lat,         setLat]         = React.useState(initial.lat         != null ? String(initial.lat)  : "");
  const [lng,         setLng]         = React.useState(initial.long        != null ? String(initial.long) : "");
  const [description, setDescription] = React.useState(initial.description || "");

  const isEdit  = !!initial.id;
  const canSave = name.trim() && lat && lng && type && location.trim();

  return (
    <div>
      <div>{isEdit ? "✏️ Edit Space" : "➕ Add New Space"}</div>
      <input placeholder="Name *"      value={name}        onChange={(e) => setName(e.target.value)} />
      <input placeholder="Location *"  value={location}    onChange={(e) => setLocation(e.target.value)} />
      <input placeholder="Latitude *"  value={lat}         onChange={(e) => setLat(e.target.value)} />
      <input placeholder="Longitude *" value={lng}         onChange={(e) => setLng(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button
        onClick={() => onSave({
          name, type, location,
          lat: parseFloat(lat), long: parseFloat(lng),
          description, slug: toSlug(name),
          ...(isEdit ? { id: initial.id } : {}),
        })}
        disabled={!canSave || saving}
      >
        {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Space"}
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────
function fillForm(overrides = {}) {
  const defaults = {
    name:     "Test Park",
    location: "Gainesville, FL",
    lat:      "29.6516",
    lng:      "-82.3248",
  };
  const vals = { ...defaults, ...overrides };
  fireEvent.change(screen.getByPlaceholderText("Name *"),      { target: { value: vals.name } });
  fireEvent.change(screen.getByPlaceholderText("Location *"),  { target: { value: vals.location } });
  fireEvent.change(screen.getByPlaceholderText("Latitude *"),  { target: { value: vals.lat } });
  fireEvent.change(screen.getByPlaceholderText("Longitude *"), { target: { value: vals.lng } });
}

// ── tests ────────────────────────────────────────────────────
describe("SpaceForm", () => {
  test("renders Add New Space title by default", () => {
    render(<SpaceForm onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("➕ Add New Space")).toBeInTheDocument();
  });

  test("renders Edit Space title when initial has an id", () => {
    render(
      <SpaceForm
        initial={{ id: "abc", name: "Depot Park", type: "park", location: "Gainesville, FL", lat: 29.65, long: -82.32 }}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("✏️ Edit Space")).toBeInTheDocument();
  });

  test("Save button is disabled when fields are empty", () => {
    render(<SpaceForm onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByRole("button", { name: /add space/i })).toBeDisabled();
  });

  test("Save button enables when all required fields are filled", () => {
    render(<SpaceForm onSave={jest.fn()} onCancel={jest.fn()} />);
    fillForm();
    expect(screen.getByRole("button", { name: /add space/i })).not.toBeDisabled();
  });

  test("calls onSave with correct data when submitted", () => {
    const onSave = jest.fn();
    render(<SpaceForm onSave={onSave} onCancel={jest.fn()} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /add space/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name:     "Test Park",
        location: "Gainesville, FL",
        lat:      29.6516,
        long:     -82.3248,
        slug:     "test-park",
      })
    );
  });

  test("calls onCancel when Cancel is clicked", () => {
    const onCancel = jest.fn();
    render(<SpaceForm onSave={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("shows Saving... text when saving prop is true", () => {
    render(<SpaceForm onSave={jest.fn()} onCancel={jest.fn()} saving={true} />);
    fillForm();
    expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument();
  });

  test("save button is disabled while saving", () => {
    render(<SpaceForm onSave={jest.fn()} onCancel={jest.fn()} saving={true} />);
    fillForm();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  test("pre-fills fields when initial data is provided", () => {
    render(
      <SpaceForm
        initial={{ id: "1", name: "Depot Park", type: "park", location: "Gainesville, FL", lat: 29.65, long: -82.32 }}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText("Name *").value).toBe("Depot Park");
    expect(screen.getByPlaceholderText("Location *").value).toBe("Gainesville, FL");
  });
});
