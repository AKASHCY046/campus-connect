let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
};

export const getAuthToken = () => currentToken;

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// How long to wait for the backend before giving up and letting callers fall
// back to the local data layer.
const REQUEST_TIMEOUT_MS = 2500;

// Simple circuit breaker: once the backend looks unreachable we stop hammering
// it for a while so the localStorage fallback path stays instant. The "open"
// timestamp is mirrored to sessionStorage so a page reload in the same tab
// session doesn't pay the timeout cost again.
const CIRCUIT_OPEN_MS = 20_000;
const CIRCUIT_KEY = 'cc_backend_offline_at';
let circuitOpenedAt = readPersistedCircuit();

function readPersistedCircuit(): number {
  try {
    const raw = sessionStorage.getItem(CIRCUIT_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function isCircuitOpen() {
  return circuitOpenedAt > 0 && Date.now() - circuitOpenedAt < CIRCUIT_OPEN_MS;
}

function tripCircuit() {
  circuitOpenedAt = Date.now();
  try {
    sessionStorage.setItem(CIRCUIT_KEY, String(circuitOpenedAt));
  } catch {
    /* ignore */
  }
}

function resetCircuit() {
  circuitOpenedAt = 0;
  try {
    sessionStorage.removeItem(CIRCUIT_KEY);
  } catch {
    /* ignore */
  }
}

/** True when the backend has recently failed a connection attempt. */
export const isBackendOffline = () => isCircuitOpen();

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
}

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  if (isCircuitOpen()) {
    throw new Error('BACKEND_UNAVAILABLE');
  }

  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    tripCircuit();
    throw new Error('BACKEND_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }

  resetCircuit();

  const responseText = await response.text();
  let json: ApiResponse<T>;

  try {
    json = JSON.parse(responseText);
  } catch {
    if (response.status === 403) {
      const isDeleted = /deleted/i.test(responseText);
      const isDeactivated = /deactivated/i.test(responseText);
      throw new Error(
        isDeleted ? 'ACCOUNT_DELETED' : isDeactivated ? 'ACCOUNT_DEACTIVATED' : 'ACCESS_DENIED',
      );
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json.data;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => apiRequest<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestInit) => apiRequest<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestInit) => apiRequest<T>('PUT', path, body, options),
  delete: <T>(path: string, options?: RequestInit) => apiRequest<T>('DELETE', path, undefined, options),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) => apiRequest<T>('PATCH', path, body, options),
};
