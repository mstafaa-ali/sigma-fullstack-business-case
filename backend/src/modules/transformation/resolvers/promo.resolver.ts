export class PromoResolver {
  extract(note: string | null | undefined): string | null {
    if (note === null || note === undefined) return null;

    const trimmed = note.trim();

    // Check for "/" pattern (e.g., "RN/CO/CODE" -> "CODE")
    if (note.includes('/')) {
      const segments = note.split('/');
      return segments[segments.length - 1].trim();
    }

    // Return as-is (including empty/space)
    return note;
  }
}
