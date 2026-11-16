const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "long",
  timeStyle: "medium",
  timeZone: "Europe/Istanbul",
});
export function formatTimestamp(value: string): string {
  return dateFormat.format(new Date(value));
}
