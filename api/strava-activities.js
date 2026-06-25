// api/strava-activities.js - Fetch activities for a date using real OAuth token
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { access_token, date } = req.body;
    const d = new Date(date);
    const after  = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime() / 1000);
    const before = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime() / 1000);

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&before=${before}&per_page=20`,
      { headers: { "Authorization": `Bearer ${access_token}` } }
    );
    if (!response.ok) return res.status(response.status).json({ error: "Strava API error", activities: [] });

    const acts = await response.json();
    const activities = acts.map(a => ({
      id: String(a.id),
      name: a.name,
      sport_type: a.sport_type || a.type,
      distance_m: a.distance || 0,
      moving_time_s: a.moving_time || 0,
      calories: a.calories || 0,
      elevation_m: a.total_elevation_gain || 0,
    }));
    return res.status(200).json({ activities });
  } catch(err) {
    return res.status(500).json({ error: err.message, activities: [] });
  }
};
