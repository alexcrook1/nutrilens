// api/sheets.js - Write data to Google Sheets via Anthropic MCP
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { sheet, rows } = req.body;
    // Use Claude with Google Sheets MCP to append rows
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        mcp_servers: [{
          type: "url",
          url: "https://sheets.googleapis.com/mcp/v1",
          name: "google-sheets"
        }],
        messages: [{
          role: "user",
          content: `Append these rows to the sheet named "${sheet}" in spreadsheet ID "19T988OPgeQGbwmkapgNfy7NNwcx-8V8DBrkB66LCquE":
${JSON.stringify(rows)}
Use the append tool. Confirm when done with just "done".`
        }]
      })
    });
    const data = await response.json();
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
