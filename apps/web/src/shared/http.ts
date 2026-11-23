const configured = import.meta.env.VITE_API_BASE_URL?.trim() || '';
const baseUrl = configured.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new ApiError(response.status, `A API respondeu com ${response.status}`);
  return response.json() as Promise<T>;
}
