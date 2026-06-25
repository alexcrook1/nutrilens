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

    const headers = { "Authorization": `Bearer ${access_token}` };

    // Step 1: Get activity list
    const listRes = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&before=${before}&per_page=20`,
      { headers }
    );
    if (!listRes.ok) return res.status(listRes.status).json({ error: "Strava list error", activities: [] });
    const list = await listRes.json();

    // MET fallback values
    const MET = { Run:9.8, VirtualRun:9.8, Walk:3.5, Hike:5.3, Ride:7.5,
                  VirtualRide:7.5, Swim:8.0, Workout:5.0, WeightTraining:5.0,
                  Yoga:2.5, default:5.0 };
    const WEIGHT_KG = 77.5;

    // Step 2: Fetch detailed data for each activity to get calories
    const activities = await Promise.all(list.map(async (a) => {
      let calories = a.calories || 0;

      // If no calories in list, fetch detailed activity
      if (!calories) {
        try {
          const detailRes = await fetch(
            `https://www.strava.com/api/v3/activities/${a.id}`,
            { headers }
          );
          if (detailRes.ok) {
            const detail = await detailRes.json();
            calories = detail.calories || 0;
          }
        } catch(e) { /* fall through to MET estimate */ }
      }

      // Final fallback: MET estimate
      if (!calories && a.moving_time) {
        const met = MET[a.sport_type] || MET[a.type] || MET.default;
        calories = Math.round((met * WEIGHT_KG * 3.5 / 200) * (a.moving_time / 60));
      }

      return {
        id: String(a.id),
        name: a.name,
        sport_type: a.sport_type || a.type,
        distance_m: a.distance || 0,
        moving_time_s: a.moving_time || 0,
        calories,
        elevation_m: a.total_elevation_gain || 0,
      };
    }));

    return res.status(200).json({ activities });
  } catch(err) {
    return res.status(500).json({ error: err.message, activities: [] });
  }
};
