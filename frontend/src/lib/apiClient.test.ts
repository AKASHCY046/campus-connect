import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('apiClient circuit breaker', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('maps a failed fetch to BACKEND_UNAVAILABLE and opens the circuit', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    const { api, isBackendOffline } = await import('./apiClient');

    await expect(api.get('/anything')).rejects.toThrow('BACKEND_UNAVAILABLE');
    expect(isBackendOffline()).toBe(true);

    // Second call short-circuits without touching fetch again.
    await expect(api.get('/again')).rejects.toThrow('BACKEND_UNAVAILABLE');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('unwraps a successful ApiResponse envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, message: 'ok', data: { id: 'x' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('./apiClient');

    await expect(api.get('/thing')).resolves.toEqual({ id: 'x' });
  });

  it('throws the server message when success is false', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ success: false, message: 'nope', data: null }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('./apiClient');

    await expect(api.post('/thing', {})).rejects.toThrow('nope');
  });
});
