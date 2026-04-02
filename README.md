People Party is a Next.js app backed by Prisma and MySQL.

## Environment Variables

Set these variables for local development or in Vercel:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/peopleparty
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-admin-password
```

Use `vercel.env.example` as the Vercel template, or copy `.env.example` for local setup.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Push the Prisma schema to the database:

```bash
npm run db:push
```

3. Optionally seed data:

```bash
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

Set the same four environment variables in Vercel, then deploy. Prisma will use `DATABASE_URL` from the deployment environment.
