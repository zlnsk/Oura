# Oura Analytics

**The web-based health intelligence platform your Oura Ring deserves.**

Your Oura Ring captures an extraordinary amount of health data — sleep stages, heart rate variability, readiness scores, stress levels, SpO2, workouts, and more. But until now, there hasn't been a dedicated web tool to truly explore, analyze, and understand that data on a larger screen with richer visualizations.

**Oura Analytics fills that gap.**

## Why Oura Analytics?

The official Oura app is great for daily check-ins on your phone. But when you want to sit down and *really* dig into your health trends — spot patterns across weeks, compare sleep quality against readiness, or get AI-powered insights from your data — you need something more.

- **See the full picture.** Interactive charts and trend lines across 14 health dimensions, from deep sleep duration to cardiovascular age.
- **Explore freely.** Select any date range from 1 to 365 days. Navigate day by day or zoom out to see the big picture.
- **AI-powered insights.** Get personalized health summaries powered by Claude, with specific observations and actionable tips drawn from your actual data.
- **Built for the big screen.** A responsive, beautifully crafted dashboard designed for web browsers — not squeezed into a phone UI.

## What You Get

| Page | What It Shows |
|------|--------------|
| **Dashboard** | Today's scores at a glance — sleep, activity, readiness — with AI-generated health summary |
| **Sleep** | Sleep stages breakdown, duration trends, efficiency, bedtime patterns, HRV and heart rate during sleep |
| **Activity** | Steps, calories, activity intensity distribution, movement trends |
| **Readiness** | Recovery scores, temperature deviations, readiness contributors |
| **Heart Rate** | Resting HR trends, HRV analysis, lowest heart rate tracking |
| **Stress** | Stress-to-recovery balance, daytime recovery, SpO2, cardiovascular age |
| **Workouts** | Exercise history with type, duration, intensity, and calorie tracking |

## Tech Stack

Built with modern web technologies for speed and reliability:

- **Next.js 14** — Fast, server-rendered React framework
- **TypeScript** — Type-safe from API to UI
- **Recharts** — Beautiful, interactive data visualizations
- **Tailwind CSS** — Clean, responsive design with dark mode
- **Claude AI** — Intelligent health summaries powered by Anthropic
- **Vercel** — Production deployment with edge performance

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/zlnsk/Oura.git
cd Oura
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_URL` | Yes | Your app URL (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `ANTHROPIC_API_KEY` | No | Server-side AI summaries (users can also add their own in Settings) |

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and add your [Oura Personal Access Token](https://cloud.ouraring.com/personal-access-tokens) in Settings.

## Security

Your data stays yours:

- **API keys stored in httpOnly cookies** — not accessible to JavaScript, protected from XSS
- **Google OAuth** — no passwords to manage
- **No database** — your health data is fetched directly from Oura's API and cached locally in your browser
- **Security headers** — CSP, HSTS, X-Frame-Options, and more

## License

Private repository. All rights reserved.
