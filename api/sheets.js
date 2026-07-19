// api/sheets.js - Google Sheets sync with auto token refresh
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { sheet, rows } = req.body;
    const SHEET_ID = "19T988OPgeQGbwmkapgNfy7NNwcx-8V8DBrkB66LCquE";

    // Get fresh access token using refresh token
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

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Token refresh failed:", tokenData);
      return res.status(200).json({ ok: false, error: "Token refresh failed" });
    }

    const access_token = tokenData.access_token;

    // Ensure sheet/tab exists by trying to append
    const range = encodeURIComponent(`${sheet}!A1`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const sheetsRes = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: rows })
    });

    if (!sheetsRes.ok) {
      const err = await sheetsRes.text();
      console.error("Sheets API error:", err);
      return res.status(200).json({ ok: false, error: err });
    }

    const data = await sheetsRes.json();
    return res.status(200).json({ ok: true, updated: data.updates?.updatedRows });
  } catch (err) {
    console.error("Sheets sync error:", err.message);
    return res.status(200).json({ ok: false, error: err.message });
  }
};
