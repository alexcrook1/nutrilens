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

    // MET values for calorie estimation when Strava doesn't provide them
    const MET = { Run:9.8, VirtualRun:9.8, Walk:3.5, Hike:5.3, Ride:7.5, VirtualRide:7.5,
                  Swim:8.0, Workout:5.0, WeightTraining:5.0, Yoga:2.5, default:5.0 };
    const WEIGHT_KG = 77.5; // Alex's weight

    const activities = acts.map(a => {
      // Use Strava calories if available and non-zero
      let calories = a.calories || 0;

      // Otherwise estimate from MET * weight * time
      if (!calories && a.moving_time) {
        const met = MET[a.sport_type] || MET[a.type] || MET.default;
        const minutes = a.moving_time / 60;
        calories = Math.round((met * WEIGHT_KG * 3.5 / 200) * minutes);
      }

      return {
        id: String(a.id),
        name: a.name,
        sport_type: a.sport_type || a.type,
        distance_m: a.distance || 0,
        moving_time_s: a.moving_time || 0,
        calories,
        calories_estimated: !a.calories,
        elevation_m: a.total_elevation_gain || 0,
      };
    });

    return res.status(200).json({ activities });
  } catch(err) {
    return res.status(500).json({ error: err.message, activities: [] });
  }
};
