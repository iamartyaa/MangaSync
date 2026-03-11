# Deployment Guide: MangaSync on Vercel

MangaSync is built natively on Next.js, making Vercel the optimal hosting choice for unparalleled performance (Edge Network, instant CI/CD, and Serverless API Routes natively matching your `app/api`).

Below are the exact steps to transition this repository to a live, state-of-the-art web application.

---

## Step 1: Push to GitHub

Ensure all recent changes are securely committed to your remote repository.

```bash
git add .
git commit -m "feat: finalize app structure, setup fable TTS, lingo.dev hooks"
git push origin main
```

## Step 2: Connect to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** and select **Project**.
3. Locate the `MangaSync` (or your chosen repository name) repository in the "Import Git Repository" list and click **Import**.
4. Allow Vercel to automatically detect the **Next.js** framework preset.

## Step 3: Configure Environment Secrets

Crucially, **Do not deploy without setting your environment variables!** Vercel needs access to the same keys you stored in your local `.env`.

On the *Configure Project* page, scroll down to the **Environment Variables** section. Add the following strictly (matching exactly, case-sensitive):

1. **OpenAI Access**
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (Your OpenAI Project/Platform Secret Key)
   
2. **Lingo.dev Translation Layer**
   - **Key:** `LINGO_API_KEY`
   - **Value:** (Your secret access token generated for your Lingo.dev project layer)

*Optional, if you configured extra telemetry or database routing, add those here as well. After they are added to Vercel, click **Deploy**.*

## Step 4: Verify Post-Deployment

1. Vercel will build your application, executing a final TypeScript check (`tsc`) and a Production Build (`next build`).
2. Once successful, visit the provided alias domain (e.g., `mangasync.vercel.app`).
3. **Core Function Check Workflow:**
   - Drop a panel image into the upload bay. (Note: Images are processed flawlessly via zero-storage in-memory Base64 buffers directly on Vercel Edge).
   - Verify Vision parses the image and displays bubbles.
   - Switch language contexts through the `@lingo.dev` powered UI. 
   - Press **Play Narration** — ensure the API proxy routes don't timeout (Vercel Serverless Functions have a 10s default max duration on the free Hobby tier; for long mangas, consider switching route to Edge `export const runtime = 'edge'` or Pro tier if timeouts occur).

---

## Pro-tip: Future GitHub Iterations

Because Vercel connects automatically to Github, any future Git commit merged strictly into the `main` branch will seamlessly trigger an automated production rollout in minutes. Push gracefully!
