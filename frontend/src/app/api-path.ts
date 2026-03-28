import { environment } from '../environments/environment';

/** Full URL for API paths; dev uses relative `/api/...` (proxy). */
export function apiPath(relativePath: string): string {
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return base ? `${base}${path}` : path;
}
