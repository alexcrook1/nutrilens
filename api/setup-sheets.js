module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const SHEET_ID = "19T988OPgeQGbwmkapgNfy7NNwcx-8V8DBrkB66LCquE";

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token"
      })
    });
    const { access_token } = await tokenRes.json();

    const sheets = [
      { name: "Meals", headers: ["Timestamp","Date","Time","Name","Type","Calories","Protein_g","Carbs_g","Fat_g","Volume_ml","Hydration_ml","Caffeine_mg","Confidence","Notes"] },
      { name: "Activities", headers: ["Timestamp","Date","Time","Name","Sport","Duration_min","Distance_km","Calories","Elevation_m","Source"] },
      { name: "Weights", headers: ["Timestamp","Date","Weight_kg","Waist_cm","RHR_bpm","BMI"] },
      { name: "Checkins", headers: ["Timestamp","Date","Sleep_hrs","Sleep_quality","Energy_1to5"] },
    ];

    // Add headers to each sheet
    for (const s of sheets) {
      const range = encodeURIComponent(s.name + "!A1");
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [s.headers] })
      });
    }

    return res.status(200).json({ ok: true, message: "Sheets set up with headers" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};