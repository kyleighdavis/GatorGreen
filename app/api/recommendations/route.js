import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { searches, profile, previousSpaces } = await request.json();

    if (!searches || searches.length < 2) {
      return Response.json({ error: "Not enough search history" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const activityText = profile?.preferred_activities
      ? `The user enjoys: ${profile.preferred_activities}.`
      : "The user is open to any type of outdoor nature space.";

    const radiusText = profile?.max_radius ? `${profile.max_radius} miles` : "15 miles";

    // Build a detailed summary for each search with its anchor coords
    const searchSummary = searches.map((s, i) => {
      const label = s.location_name || s.address
        || (s.lat ? `${parseFloat(s.lat).toFixed(4)}, ${parseFloat(s.long).toFixed(4)}` : "Unknown");
      const coords = s.lat && s.long
        ? ` (${parseFloat(s.lat).toFixed(4)}, ${parseFloat(s.long).toFixed(4)})`
        : "";
      const spaceNames = (s.spaces || []).slice(0, 4).map((sp) => sp.name).filter(Boolean).join(", ");
      return `Search ${i + 1}: near "${label}"${coords}${spaceNames ? ` — already found: ${spaceNames}` : ""}`;
    }).join("\n");

    const avoidClause = previousSpaces?.length
      ? `\nDo NOT recommend any of these spaces that were shown previously: ${previousSpaces.map((s) => s.name).join(", ")}.`
      : "";

    const prompt = `You are a nature and outdoor recreation expert building a personalized recommendation engine.

${activityText}
The user prefers spaces within ${radiusText} of each location they have searched.

Here are their ${searches.length} most recent searches (most recent first):
${searchSummary}

Recommend exactly 3 green spaces they would enjoy — one space drawn from near each search location, distributed across the different areas they have been exploring. Do not repeat spaces they have already found.${avoidClause}

Return a JSON array of exactly 3 spaces. Each item must follow this exact schema:
{
  "name": "string — official name of the space",
  "type": "string — one of: park, garden, trail, wetland, nature_preserve, greenway",
  "lat": number — accurate latitude,
  "lng": number — accurate longitude,
  "location": "string — city or regional area, e.g. 'Gainesville, FL'",
  "distance_miles": number — approximate distance from its corresponding search location,
  "description": "string — one sentence describing what makes this space special and why this user would love it"
}

Rules:
- Only include real places that actually exist
- Each recommendation should be near a different one of the search locations listed above
- Match the user's stated activity preferences
- Return ONLY the JSON array, no markdown, no explanation`;

    const result  = await model.generateContent(prompt);
    const text    = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const spaces  = JSON.parse(cleaned);

    if (!Array.isArray(spaces)) throw new Error("Gemini did not return an array");

    const validated = spaces
      .slice(0, 3)
      .filter((s) => s.name && typeof s.lat === "number" && typeof s.lng === "number");

    return Response.json({ spaces: validated });

  } catch (err) {
    console.error("[recommendations]", err);
    return Response.json(
      { error: err.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
