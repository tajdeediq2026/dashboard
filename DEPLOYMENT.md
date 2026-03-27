# Dashboard Deployment (GitHub -> Vercel)

This repository uses GitHub Actions workflow:

- .github/workflows/deploy-vercel.yml

## Required GitHub repository secrets

Add these in: Settings -> Secrets and variables -> Actions

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

## Vercel environment variables

In Vercel project settings, add:

- NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_DOMAIN

## Deploy

- Push to main branch, or
- Run workflow manually from Actions tab: Deploy Dashboard To Vercel
