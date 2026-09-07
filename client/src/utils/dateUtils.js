/**
 * Formats a Date object or ISO string to YYYY-MM-DD format
 */
export function formatISODate(dateObj) {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in YYYY-MM-DD
 */
export function getTodayISO() {
  return formatISODate(new Date());
}

/**
 * Returns tomorrow's date in YYYY-MM-DD
 */
export function getTomorrowISO() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatISODate(tomorrow);
}

/**
 * Returns yesterday's date in YYYY-MM-DD
 */
export function getYesterdayISO() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatISODate(yesterday);
}

/**
 * Formats YYYY-MM-DD to friendly human-readable format like:
 * "Sunday, September 6, 2026"
 */
export function formatFullDisplayDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats YYYY-MM-DD to short display like:
 * "Sep 6" or "Today" or "Tomorrow"
 */
export function formatShortDisplayDate(isoDate) {
  if (!isoDate) return '';
  const today = getTodayISO();
  const tomorrow = getTomorrowISO();
  const yesterday = getYesterdayISO();

  if (isoDate === today) return 'Today';
  if (isoDate === tomorrow) return 'Tomorrow';
  if (isoDate === yesterday) return 'Yesterday';

  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Shifts an ISO date string by N days
 */
export function shiftDate(isoDate, daysDelta) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() + daysDelta);
  return formatISODate(dateObj);
}

/**
 * Formats 24h time "18:00" into "6:00 PM"
 */
export function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const dateObj = new Date();
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
