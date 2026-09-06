export function calculateMinutes(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60));
}

export function formatDurationHuman(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} jam ${mins} mnt`;
  } else if (hours > 0) {
    return `${hours} jam`;
  } else {
    return `${mins} menit`;
  }
}

export function calculateFee(billedMinutes: number, hourlyRate: number): number {
  return Math.round((billedMinutes / 60) * hourlyRate);
}
