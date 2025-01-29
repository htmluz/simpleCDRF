import { format } from "date-fns";

export function convertToIsoGMTMinus3(dateString: string): string | Date {
  if (dateString == undefined) {
    return "";
  }
  const regex =
    /(\d{2}:\d{2}:\d{2}\.\d{3}) \+0000 (\w{3}) (\w{3}) (\d{2}) (\d{4})/;
  const match = dateString.match(regex);
  if (!match) {
    return "";
  }
  const [_, time, dayOfWeek, month, day, year] = match;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = monthNames.indexOf(month);
  if (monthIndex === -1) {
    throw new Error("Invalid month");
  }
  const utcDateString = `${year}-${String(monthIndex + 1).padStart(
    2,
    "0"
  )}-${day}T${time}Z`;
  const utcDate = new Date(utcDateString);
  return new Date(utcDate.getTime() - 0 * 60 * 60 * 1000);
}

export function convertFromUnixtoIso(timestamp: string | undefined): string {
  if (!timestamp) {
    return "";
  }
  try {
    const bigIntTimestamp = BigInt(timestamp);
    const milliseconds = Number(bigIntTimestamp / BigInt(1000000));
    const date = new Date(milliseconds);
    return date.toISOString();
  } catch (error) {
    console.error("Erro ao converter timestamp:", error);
    return "Invalid timestamp";
  }
}

export function isoToNanoTimestamp(isoString: string): string {
  const milliseconds = new Date(isoString).getTime();
  const nanoseconds = milliseconds.toString() + "000000";
  return nanoseconds;
}

export function formatDate(date: string | Date): string {
  if (date == "") {
    return "";
  }
  return format(date, "dd/MM/yyyy HH:mm:ss");
}
