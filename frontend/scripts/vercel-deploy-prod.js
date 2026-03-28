/**
 * Vercel CLI walks up to the monorepo .git and may block deploys on Hobby/private repos.
 * Deploying from a temp copy avoids parent .git.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const frontendRoot = path.resolve(__dirname, '..');
const tmpRoot = path.join(os.tmpdir(), `sfsp-frontend-vercel-${Date.now()}`);

const SKIP_TOP = new Set([
  'node_modules',
  'dist',
  '.angular',
  '.env',
  '.git',
]);

function shouldCopy(src) {
  const rel = path.relative(frontendRoot, src);
  if (!rel || rel === '.') return true;
  const parts = rel.split(path.sep);
  if (SKIP_TOP.has(parts[0])) return false;
  if (parts[0].startsWith('.env')) return false;
  if (parts.includes('node_modules')) return false;
  if (parts.includes('dist')) return false;
  if (parts.includes('.angular')) return false;
  return true;
}

console.log(
  '\n[Vercel] Monorepo-safe frontend deploy (temp copy). Do not use plain `vercel deploy` from frontend/.\n'
);

fs.cpSync(frontendRoot, tmpRoot, {
  recursive: true,
  filter: (src) => shouldCopy(src),
});

try {
  execSync('npx vercel deploy --prod --yes', {
    cwd: tmpRoot,
    stdio: 'inherit',
    env: { ...process.env },
  });
} finally {
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch {
    // Windows can hold temp locks briefly; deploy already finished.
  }
}
