// Tests for pure utility functions used across the app

// ── toSlug ──────────────────────────────────────────────────
// Copied from dashboard so we can test it in isolation
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

describe("toSlug", () => {
  test("lowercases the string", () => {
    expect(toSlug("Depot Park")).toBe("depot-park");
  });

  test("replaces spaces with hyphens", () => {
    expect(toSlug("Paynes Prairie")).toBe("paynes-prairie");
  });

  test("replaces special characters with hyphens", () => {
    expect(toSlug("Park & Ride!")).toBe("park-ride");
  });

  test("removes leading and trailing hyphens", () => {
    expect(toSlug("  Trail  ")).toBe("trail");
  });

  test("handles already-slugged strings", () => {
    expect(toSlug("depot-park")).toBe("depot-park");
  });

  test("collapses multiple spaces/symbols into one hyphen", () => {
    expect(toSlug("Haile   ---   Trail")).toBe("haile-trail");
  });

  test("returns empty string for empty input", () => {
    expect(toSlug("")).toBe("");
  });
});

// ── distance display logic ───────────────────────────────────
// Mirrors the inline ternary used in SpaceCard / PastSearches
function formatDistance(miles) {
  if (miles == null) return null;
  return miles < 1
    ? `${(miles * 5280).toFixed(0)} ft`
    : `${miles.toFixed(1)} mi`;
}

describe("formatDistance", () => {
  test("shows feet when under 1 mile", () => {
    expect(formatDistance(0.5)).toBe("2640 ft");
  });

  test("shows miles when 1 mile or more", () => {
    expect(formatDistance(1.0)).toBe("1.0 mi");
  });

  test("shows miles with one decimal", () => {
    expect(formatDistance(3.75)).toBe("3.8 mi");
  });

  test("returns null when distance is null", () => {
    expect(formatDistance(null)).toBeNull();
  });

  test("handles very small distances", () => {
    expect(formatDistance(0.1)).toBe("528 ft");
  });
});
