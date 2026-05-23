export function toDate(value: any): Date {
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value?.seconds != null) return new Date(value.seconds * 1000);
  return new Date(value);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
