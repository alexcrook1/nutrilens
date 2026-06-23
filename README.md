# NutriLens 🔬

Personal health and nutrition tracker built for Alex. Deployed on Vercel.

## Features
- AI meal analysis (photo + description) via Claude
- Strava auto-sync for activity data
- Calorie & macro tracking with goal modes
- BMI, weight trend, goal progress
- Morning check-in (sleep, energy, water)
- Daily AI insights personalised to your data

## Stack
- Frontend: Vanilla HTML/CSS/JS PWA
- Backend: Vercel serverless functions
- AI: Anthropic Claude Sonnet via server-side proxy
- Activity: Strava MCP integration

## Environment Variables (set in Vercel dashboard)
- `ANTHROPIC_API_KEY` — your Anthropic API key

## Local dev
```bash
npm i -g vercel
vercel dev
```
