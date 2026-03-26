import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useState } from "react";

// ── Inline the onboarding logic we want to test ──────────────

const ROLE_OPTIONS = [
  { value: "explorer",    label: "Explorer — I enjoy outdoor spaces for recreation" },
  { value: "naturalist",  label: "Naturalist — I study flora, fauna, and ecosystems" },
  { value: "park_ranger", label: "Park Ranger / Professional" },
];

const ACTIVITY_PRESETS = [
  "Hiking", "Bird watching", "Photography", "Trail running",
  "Dog walking", "Picnicking", "Kayaking", "Cycling",
];

const RADIUS_OPTIONS = [5, 10, 20, 50];

// buildActivityString logic from onboarding
function buildActivityString(activities, customAct) {
  const all = [...activities];
  if (customAct.trim())
    all.push(...customAct.split(",").map((s) => s.trim()).filter(Boolean));
  return all.join(", ");
}

// Validation logic from onboarding
function validate(role, activities, customAct) {
  if (!role) return "Please select your role.";
  if (activities.length === 0 && !customAct.trim())
    return "Please select at least one activity.";
  return null;
}

// Minimal renderable form for testing
function OnboardingForm({ onSubmit }) {
  const [role,       setRole]       = useState("");
  const [activities, setActivities] = useState([]);
  const [customAct,  setCustomAct]  = useState("");
  const [maxRadius,  setMaxRadius]  = useState(10);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);

  const toggleActivity = (act) =>
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );

  const handleSubmit = () => {
    const err = validate(role, activities, customAct);
    if (err) { setError(err); return; }
    setLoading(true);
    onSubmit({ role, activityString: buildActivityString(activities, customAct), maxRadius });
  };

  return (
    <div>
      <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="role">
        <option value="" disabled>Select your role</option>
        {ROLE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <div>
        {ACTIVITY_PRESETS.map((act) => (
          <button key={act} type="button" onClick={() => toggleActivity(act)}
            aria-pressed={activities.includes(act)}>
            {act}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Other activities (comma separated)"
        value={customAct}
        onChange={(e) => setCustomAct(e.target.value)}
      />

      <div>
        {RADIUS_OPTIONS.map((r) => (
          <button key={r} type="button" onClick={() => setMaxRadius(r)}
            aria-pressed={maxRadius === r}>
            {r} mi
          </button>
        ))}
      </div>

      {error && <p role="alert">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Submit"}
      </button>
    </div>
  );
}

// ── tests ────────────────────────────────────────────────────
describe("Onboarding form", () => {
  test("renders role dropdown", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    expect(screen.getByRole("combobox", { name: /role/i })).toBeInTheDocument();
  });

  test("renders all activity preset buttons", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Hiking" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cycling" })).toBeInTheDocument();
  });

  test("shows error when submitting without a role", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please select your role.");
  });

  test("shows error when submitting without any activity", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: /role/i }), {
      target: { value: "explorer" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please select at least one activity.");
  });

  test("toggling an activity selects it", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    const btn = screen.getByRole("button", { name: "Hiking" });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  test("toggling the same activity twice deselects it", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    const btn = screen.getByRole("button", { name: "Hiking" });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  test("calls onSubmit with correct data when form is valid", () => {
    const onSubmit = jest.fn();
    render(<OnboardingForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("combobox", { name: /role/i }), {
      target: { value: "explorer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Hiking" }));
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ role: "explorer", activityString: "Hiking" })
    );
  });

  test("custom activity text is included in submission", () => {
    const onSubmit = jest.fn();
    render(<OnboardingForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole("combobox", { name: /role/i }), {
      target: { value: "naturalist" },
    });
    fireEvent.change(screen.getByPlaceholderText(/other activities/i), {
      target: { value: "Foraging, Sketching" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ activityString: "Foraging, Sketching" })
    );
  });

  test("radius defaults to 10 mi", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    expect(screen.getByRole("button", { name: "10 mi" })).toHaveAttribute("aria-pressed", "true");
  });

  test("clicking a radius button selects it", () => {
    render(<OnboardingForm onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "20 mi" }));
    expect(screen.getByRole("button", { name: "20 mi" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "10 mi" })).toHaveAttribute("aria-pressed", "false");
  });
});

// ── buildActivityString unit tests ───────────────────────────
describe("buildActivityString", () => {
  test("joins preset activities with comma", () => {
    expect(buildActivityString(["Hiking", "Cycling"], "")).toBe("Hiking, Cycling");
  });

  test("appends custom activities", () => {
    expect(buildActivityString(["Hiking"], "Foraging, Sketching"))
      .toBe("Hiking, Foraging, Sketching");
  });

  test("handles only custom activities", () => {
    expect(buildActivityString([], "Foraging")).toBe("Foraging");
  });

  test("trims whitespace from custom entries", () => {
    expect(buildActivityString([], "  Hiking ,  Cycling  ")).toBe("Hiking, Cycling");
  });

  test("ignores empty custom string", () => {
    expect(buildActivityString(["Hiking"], "")).toBe("Hiking");
  });

  test("filters out blank comma-separated entries", () => {
    expect(buildActivityString([], "Hiking,,Cycling")).toBe("Hiking, Cycling");
  });
});
