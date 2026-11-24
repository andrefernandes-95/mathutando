const backoffMs = [2000, 6000]
const maxWaitMs = 30000

function retryAfterMs(header: string | null): number {
  if (!header) return 0
  if (/^\d+$/.test(header)) return Number(header) * 1000
  const date = Date.parse(header)
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0
}

// A 503 explicitly rejects generation. An ambiguous network failure could already have produced a billable response.
export async function retryUnavailable(
  attempt: () => Promise<Response>,
  wait: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<Response> {
  let response = await attempt()
  for (const backoff of backoffMs) {
    if (response.status !== 503) break
    const pause = Math.max(
      backoff,
      retryAfterMs(response.headers.get('retry-after')),
    )
    if (pause > maxWaitMs) break
    await response.body?.cancel()
    await wait(pause)
    response = await attempt()
  }
  return response
}
