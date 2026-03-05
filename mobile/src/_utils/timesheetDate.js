export function rangeLabel(date, period = "day") {
  const d = new Date(date);

  if (period === "day") {
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (period === "week") {
    // week: Monday -> Sunday
    const day = d.getDay(); // 0 Sun - 6 Sat
    const diffToMon = (day + 6) % 7;
    const mon = new Date(d);
    mon.setDate(d.getDate() - diffToMon);

    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const left = mon.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    const right = sun.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return `${left} - ${right}`;
  }

  // month
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}