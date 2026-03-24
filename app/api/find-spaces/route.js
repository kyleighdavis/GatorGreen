import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { name, lat, lng, address, preferred_activities, max_radius } = await request.json();

    const hasCoords  = lat != null && lng != null;
    const hasAddress = address?.trim();

    if (!hasCoords && !hasAddress) {
      return Response.json(
        { error: "Provide either lat/lng coordinates or an address" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const radiusText   = max_radius ? `${max_radius} miles` : "15 miles";
    const activityText = preferred_activities
      ? `The user enjoys: ${preferred_activities}.`
      : "The user is open to any type of outdoor nature space.";

    const locationDesc = hasCoords
      ? `coordinates ${lat}, ${lng}${name ? ` (near "${name}")` : ""}`
      : `the address "${address}"${name ? ` (near "${name}")` : ""}`;

    // Derive a clean location label for storing (city, state format)
    const locationLabel = name?.trim() || address?.trim() || `${lat}, ${lng}`;

    const prompt = `You are a nature and outdoor recreation expert.

I am currently near ${locationDesc}.
${activityText}
Please suggest spaces within ${radiusText}.

Return a JSON array of up to 10 real, distinct nature spaces near this location. Include parks, botanical gardens, nature trails, wetlands, greenways, and nature preserves that best match the user's interests.

Each item must follow this exact schema:
{
  "name": "string — official name of the space",
  "type": "string — one of: park, garden, trail, wetland, nature_preserve, greenway",
  "lat": number — accurate latitude,
  "lng": number — accurate longitude,
  "location": "string — the city or regional area this space belongs to, e.g. 'Gainesville, FL'",
  "distance_miles": number — approximate distance from the given location,
  "description": "string — one sentence describing what makes this space special"
}

Rules:
- Only include real places that actually exist
- Prioritize spaces that match the user's stated activity preferences
- The "location" field must be the city/region the space is in, not its street address
- Order by distance ascending (closest first)
- Do not include the input location itself
- Return ONLY the JSON array, no markdown, no explanation`;

    const result  = await model.generateContent(prompt);
    const text    = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const spaces  = JSON.parse(cleaned);

    if (!Array.isArray(spaces)) throw new Error("Gemini did not return an array");

    const validated = spaces
      .slice(0, 10)
      .filter((s) => s.name && typeof s.lat === "number" && typeof s.lng === "number")
      .map((s) => ({
        ...s,
        // Fallback: if Gemini didn't fill location, use the search label
        location: s.location || locationLabel,
      }));

    return Response.json({ spaces: validated });

  } catch (err) {
    console.error("[find-spaces]", err);
    return Response.json(
      { error: err.message || "Failed to fetch green spaces" },
      { status: 500 }
    );
  }
}