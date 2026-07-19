// api/sheets.js - Append rows to Google Sheets using service account or OAuth token
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { sheet, rows } = req.body;
    const SHEET_ID = "19T988OPgeQGbwmkapgNfy7NNwcx-8V8DBrkB66LCquE";
    const token = process.env.GOOGLE_SHEETS_TOKEN;

    if (!token) {
      // Fallback: just log to console and return OK so app doesn't break
      console.log(`Sheets sync (no token): ${sheet}`, rows);
      return res.status(200).json({ ok: true, note: "No token configured" });
    }

    const range = encodeURIComponent(`${sheet}!A1`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: rows })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Sheets API error:", err);
      return res.status(200).json({ ok: false, error: err }); // Don't fail the app
    }

    const data = await response.json();
    return res.status(200).json({ ok: true, updated: data.updates?.updatedRows });
  } catch (err) {
    console.error("Sheets sync error:", err.message);
    return res.status(200).json({ ok: false, error: err.message }); // Always return 200 so app continues
  }
};
