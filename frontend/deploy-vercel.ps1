# Plain "vercel deploy --prod" fails here: Vercel reads the monorepo parent .git and may block the deploy.
Set-Location $PSScriptRoot
npm run deploy
