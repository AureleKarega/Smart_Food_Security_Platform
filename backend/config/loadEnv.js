// On Vercel, env comes from the project dashboard — do not load a local .env (avoids empty overrides).
if (!process.env.VERCEL) {
  require('dotenv').config();
}
