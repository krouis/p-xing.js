const INITIALS_RE = /^[A-Z0-9]{3}$/;

export function validateInitials(input: string): boolean {
  return INITIALS_RE.test(input.toUpperCase());
}

export function normalizeInitials(input: string): string {
  return input.toUpperCase();
}
