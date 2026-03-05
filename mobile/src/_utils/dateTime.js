
function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatTime(d) {
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h === 0 ? 12 : h;

  return { hh: pad2(h), mm: pad2(d.getMinutes()), ampm };
}

export function formatDate(d) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}