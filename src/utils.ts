// Helper for creating short unique IDs
export function uuid(): string {
  return 'xxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
}
