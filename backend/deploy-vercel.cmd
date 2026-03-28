@echo off
REM Plain "vercel deploy --prod" fails here: Vercel reads the monorepo parent .git and may block the deploy.
cd /d "%~dp0"
call npm run deploy
