import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useState } from "react";

// ── Inline PastSearches ──────────────────────────────────────

const TYPE_EMOJI = {
  park: "🌳", garden: "🌸", trail: "🥾",
  wetland: "🦆", nature_preserve: "🌿", greenway: "🚴",
};

function PastSearches({ searches, onSelect }) {
  const [openIdx, setOpenIdx] = useState(null);

  if (searches === null) return <div data-testid="loading-skeleton" />;

  if (searches.length === 0) return <p>No past searches yet.</p>;

  return (
    <div>
      {searches.map((search, i) => {
        const spaces = search.spaces || [];
        const isOpen = openIdx === i;
        const label  = search.location_name || search.address
          || (search.lat ? `${parseFloat(search.lat).toFixed(3)}, ${parseFloat(search.long).toFixed(3)}` : "Unknown location");
        const date   = new Date(search.created_at).toLocaleDateString("en-US",
          { month: "short", day: "numeric", year: "numeric" });

        return (
          <div key={search.id}>
            <div
              onClick={() => {
                setOpenIdx(isOpen ? null : i);
                onSelect(spaces.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng })));
              }}
              data-testid={`search-row-${i}`}
            >
              <div>📍 {label}</div>
              <div>{date} · {spaces.length} space{spaces.length !== 1 ? "s" : ""} found</div>
            </div>
            {isOpen && (
              <div data-testid={`search-detail-${i}`}>
                {spaces.map((space, j) => (
                  <div key={j}>
                    <div>{TYPE_EMOJI[space.type] || "📍"} {space.name}</div>
                    {space.description && <div>{space.description}</div>}
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

// ── fixtures ─────────────────────────────────────────────────
const MOCK_SEARCHES = [
  {
    id: "s1",
    location_name: "Gainesville, FL",
    address: null,
    lat: 29.6516,
    long: -82.3248,
    created_at: "2025-03-01T10:00:00Z",
    spaces: [
      { name: "Depot Park", type: "park", lat: 29.651, lng: -82.324, description: "A great park" },
      { name: "Sweetwater Wetlands", type: "wetland", lat: 29.68, lng: -82.35, description: "Beautiful wetlands" },
    ],
  },
  {
    id: "s2",
    location_name: null,
    address: "123 Main St",
    lat: null,
    long: null,
    created_at: "2025-03-10T14:00:00Z",
    spaces: [],
  },
];

// ── tests ────────────────────────────────────────────────────
describe("PastSearches", () => {
  test("shows loading skeleton when searches is null", () => {
    render(<PastSearches searches={null} onSelect={jest.fn()} />);
    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  test("shows empty message when searches array is empty", () => {
    render(<PastSearches searches={[]} onSelect={jest.fn()} />);
    expect(screen.getByText("No past searches yet.")).toBeInTheDocument();
  });

  test("renders location name for each search", () => {
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={jest.fn()} />);
    expect(screen.getByText("📍 Gainesville, FL")).toBeInTheDocument();
    expect(screen.getByText("📍 123 Main St")).toBeInTheDocument();
  });

  test("renders correct space count label", () => {
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={jest.fn()} />);
    expect(screen.getByText(/2 spaces found/)).toBeInTheDocument();
    expect(screen.getByText(/0 spaces found/)).toBeInTheDocument();
  });

  test("space details are hidden before clicking", () => {
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={jest.fn()} />);
    expect(screen.queryByTestId("search-detail-0")).not.toBeInTheDocument();
  });

  test("clicking a row expands its spaces", () => {
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={jest.fn()} />);
    fireEvent.click(screen.getByTestId("search-row-0"));
    expect(screen.getByTestId("search-detail-0")).toBeInTheDocument();
    expect(screen.getByText("🌳 Depot Park")).toBeInTheDocument();
    expect(screen.getByText("🦆 Sweetwater Wetlands")).toBeInTheDocument();
  });

  test("clicking the same row again collapses it", () => {
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={jest.fn()} />);
    fireEvent.click(screen.getByTestId("search-row-0"));
    fireEvent.click(screen.getByTestId("search-row-0"));
    expect(screen.queryByTestId("search-detail-0")).not.toBeInTheDocument();
  });

  test("calls onSelect with correct locations when row is clicked", () => {
    const onSelect = jest.fn();
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("search-row-0"));
    expect(onSelect).toHaveBeenCalledWith([
      { name: "Depot Park",          lat: 29.651, lng: -82.324 },
      { name: "Sweetwater Wetlands", lat: 29.68,  lng: -82.35  },
    ]);
  });

  test("uses address as label when location_name is null", () => {
    render(<PastSearches searches={MOCK_SEARCHES} onSelect={jest.fn()} />);
    expect(screen.getByText("📍 123 Main St")).toBeInTheDocument();
  });

  test("singular 'space' label when only one space found", () => {
    const singleSpace = [{
      id: "s3", location_name: "Test", address: null,
      lat: 29.65, long: -82.32, created_at: "2025-03-15T10:00:00Z",
      spaces: [{ name: "One Park", type: "park", lat: 29.65, lng: -82.32 }],
    }];
    render(<PastSearches searches={singleSpace} onSelect={jest.fn()} />);
    expect(screen.getByText(/1 space found/)).toBeInTheDocument();
  });
});
