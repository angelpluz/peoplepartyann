People Party is a Next.js app that proxies all `news` and `report` data to a backend API.

## Environment Variables

Set these variables for local development and Vercel:

```env
BACKEND_API_BASE_URL=https://api.alprasoft-corp.com/api/v1
BACKEND_API_KEY=replace-with-backend-api-key
APP_SESSION_SECRET=replace-with-a-long-random-secret
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-admin-password
SITE_GATE_ENABLED=true
SITE_GATE_USERNAME=admin
SITE_GATE_PASSWORD=replace-with-a-strong-gate-password
SITE_GATE_TOKEN=replace-with-a-random-long-token
```

Use `vercel.env.example` as the Vercel template, or copy `.env.example` for local setup.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

Set the same environment variables in Vercel, then deploy.
