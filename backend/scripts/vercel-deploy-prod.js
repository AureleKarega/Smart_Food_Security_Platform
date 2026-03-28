/**
 * Vercel CLI walks up directories to find .git and attaches commit metadata.
 * In a monorepo, that can trigger "Git author must have access to the team"
 * on Hobby/private repos. Deploying from a temp copy avoids parent .git.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '..');
const tmpRoot = path.join(
  os.tmpdir(),
  `sfsp-backend-vercel-${Date.now()}`
);

function shouldCopy(src) {
  const rel = path.relative(backendRoot, src);
  if (!rel || rel === '.') return true;
  const parts = rel.split(path.sep);
  if (parts.includes('node_modules')) return false;
  if (parts[0] === '.env' || rel.startsWith('.env' + path.sep)) return false;
  return true;
}

console.log(
  '\n[Vercel] Monorepo-safe deploy (temp copy without parent .git). Do not use plain `vercel deploy` from backend/.\n'
);

fs.cpSync(backendRoot, tmpRoot, {
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
