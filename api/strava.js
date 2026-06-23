module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { date } = req.body;
    const rangeStart = date + "T00:00:00";
    const rangeEnd   = date + "T23:59:59";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        mcp_servers: [{ type: "url", url: "https://mcp.strava.com/mcp", name: "strava" }],
        messages: [{
          role: "user",
          content: "Use the strava list_activities tool with range_start="" + rangeStart + "" and range_end="" + rangeEnd + "". Return ONLY a JSON array, no markdown: [{"id":"...","name":"...","sport_type":"...","distance_m":number,"moving_time_s":number,"calories":number,"elevation_m":number}]. If no activities return []."
        }]
      }),
    });

    if (!response.ok) throw new Error("Anthropic API error " + response.status);
    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const match = text.match(/\[[\s\S]*?\]/);
    const activities = match ? JSON.parse(match[0]) : [];
    return res.status(200).json({ activities });
  } catch (err) {
    return res.status(500).json({ error: err.message, activities: [] });
  }
};
