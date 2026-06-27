# NutriLens 🔬

Personal health and nutrition tracker built for Alex. Deployed on Vercel.

## Features
- AI meal & drink analysis (photo + description) via Claude
- Strava auto-sync with HR-based calories
- 14 training & goal modes across 6 categories
- Calorie & macro tracking with daily targets
- Integrated hydration & caffeine tracking
- Micronutrient tracking with weekly AI alerts
- Meal memory — learns your regular meals after 5 logs
- Activity & meal suggestions powered by AI
- Progress photos with guided silhouette overlay (monthly)
- Running form, gym form & supplement AI analysis
- BMI, weight trend, goal progress
- Morning check-in (sleep, energy)
- Measurements (waist, RHR)
- Daily AI insights personalised to your data

## Stack
- Frontend: Vanilla HTML/CSS/JS PWA
- Backend: Vercel serverless functions
- AI: Anthropic Claude Sonnet via server-side proxy
- Activity: Strava OAuth integration (real-time sync)

## Environment Variables (set in Vercel dashboard)
- `ANTHROPIC_API_KEY`
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`

## Deploy trigger: v3.1
