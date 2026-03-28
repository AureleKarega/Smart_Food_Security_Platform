import { HttpErrorResponse } from '@angular/common/http';

export function httpErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (typeof err.error === 'object' && err.error && 'message' in err.error) {
      const m = (err.error as { message?: string }).message;
      if (m) return m;
    }
    if (err.status === 0) {
      return 'Cannot reach the server. Check your connection and API URL/CORS settings.';
    }
    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error.slice(0, 200);
    }
  }
  return fallback;
}
