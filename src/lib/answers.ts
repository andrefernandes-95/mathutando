/** Accepts decimals with dot/comma, ordinary fractions and percentages. */
export function parseNumericAnswer(value: string): number | null {
  const normalized = value.trim().replace(/\s+/g, '').replace(',', '.');
  if (!normalized) return null;
  if (/^[-+]?\d+(?:\.\d+)?%$/.test(normalized)) return Number(normalized.slice(0, -1)) / 100;
  if (/^[-+]?\d+(?:\.\d+)?\/[-+]?\d+(?:\.\d+)?$/.test(normalized)) {
    const [numerator, denominator] = normalized.split('/').map(Number);
    return denominator === 0 ? null : numerator / denominator;
  }
  if (/^[-+]?\d+(?:\.\d+)?$/.test(normalized)) return Number(normalized);
  return null;
}

export function matchesExpectedAnswer(value: string, expected: number, tolerance = 0.0001): boolean {
  const number = parseNumericAnswer(value);
  return number !== null && Number.isFinite(number) && Math.abs(number - expected) < tolerance;
}
