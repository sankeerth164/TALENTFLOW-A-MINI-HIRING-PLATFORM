export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Use en-IN locale and Asia/Kolkata timezone formatting with 24-hour time
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  };
  // Format like dd/mm/yyyy, HH:MM
  const parts = new Intl.DateTimeFormat('en-IN', options).formatToParts(date);
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });
  return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`;
}
