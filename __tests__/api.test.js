// Tests for /api/find-spaces and /auth/callback route logic

// ── find-spaces: input validation ───────────────────────────
// We test the validation logic directly without hitting Gemini
describe("/api/find-spaces input validation", () => {
  // Mirror the validation logic from the route
  function validate({ lat, lng, address }) {
    const hasCoords  = lat != null && lng != null;
    const hasAddress = address?.trim();
    if (!hasCoords && !hasAddress) {
      return { ok: false, error: "Provide either lat/lng coordinates or an address" };
    }
    return { ok: true };
  }

  test("rejects when neither coords nor address are provided", () => {
    expect(validate({})).toEqual({
      ok: false,
      error: "Provide either lat/lng coordinates or an address",
    });
  });

  test("accepts when lat and lng are provided", () => {
    expect(validate({ lat: 29.65, lng: -82.32 })).toEqual({ ok: true });
  });

  test("accepts when address is provided", () => {
    expect(validate({ address: "123 Main St, Gainesville FL" })).toEqual({ ok: true });
  });

  test("rejects when address is only whitespace", () => {
    expect(validate({ address: "   " })).toEqual({
      ok: false,
      error: "Provide either lat/lng coordinates or an address",
    });
  });

  test("accepts when both coords and address are provided (coords win)", () => {
    expect(validate({ lat: 29.65, lng: -82.32, address: "123 Main St" })).toEqual({ ok: true });
  });
});

// ── find-spaces: response validation ────────────────────────
describe("/api/find-spaces response validation", () => {
  // Mirror the validation logic from the route
  function validateSpaces(raw) {
    if (!Array.isArray(raw)) throw new Error("Gemini did not return an array");
    return raw
      .slice(0, 10)
      .filter((s) => s.name && typeof s.lat === "number" && typeof s.lng === "number");
  }

  test("throws when Gemini returns a non-array", () => {
    expect(() => validateSpaces({ spaces: [] })).toThrow("Gemini did not return an array");
  });

  test("filters out spaces missing name", () => {
    const result = validateSpaces([{ lat: 29.65, lng: -82.32 }]);
    expect(result).toHaveLength(0);
  });

  test("filters out spaces with non-numeric lat", () => {
    const result = validateSpaces([{ name: "Park", lat: "bad", lng: -82.32 }]);
    expect(result).toHaveLength(0);
  });

  test("keeps valid spaces", () => {
    const result = validateSpaces([
      { name: "Depot Park", lat: 29.65, lng: -82.32, type: "park" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Depot Park");
  });

  test("limits results to 10 spaces", () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      name: `Park ${i}`, lat: 29 + i * 0.01, lng: -82,
    }));
    expect(validateSpaces(many)).toHaveLength(10);
  });
});

// ── auth/callback: redirect logic ───────────────────────────
describe("auth/callback redirect logic", () => {
  // Mirror the redirect decision from the route
  function getRedirectPath(isOnboarded, next = "/dashboard") {
    return isOnboarded ? next : "/onboarding";
  }

  test("sends onboarded user to /dashboard", () => {
    expect(getRedirectPath(true)).toBe("/dashboard");
  });

  test("sends new user to /onboarding", () => {
    expect(getRedirectPath(false)).toBe("/onboarding");
  });

  test("respects custom next param for onboarded user", () => {
    expect(getRedirectPath(true, "/profile")).toBe("/profile");
  });

  test("ignores custom next param for non-onboarded user", () => {
    expect(getRedirectPath(false, "/profile")).toBe("/onboarding");
  });
});
