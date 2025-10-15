
import type { TimeZoneOption } from "../types/types";

const getCurrentTimeZone = () => -new Date().getTimezoneOffset() / 60;

export const timeZones: TimeZoneOption[] = [
  { label: "Select time zone", offset: getCurrentTimeZone() }, //5.5
  { label: "Pacific Standard Time (PST, UTC-8)", offset: -8 },
  { label: "Pacific Daylight Time (PDT, UTC-7)", offset: -7 },
  { label: "Mountain Standard Time (MST, UTC-7)", offset: -7 },
  { label: "Mountain Daylight Time (MDT, UTC-6)", offset: -6 },
  { label: "Central Standard Time (CST, UTC-6)", offset: -6 },
  { label: "Central Daylight Time (CDT, UTC-5)", offset: -5 },
  { label: "Eastern Standard Time (EST, UTC-5)", offset: -5 },
  { label: "Eastern Daylight Time (EDT, UTC-4)", offset: -4 },
  { label: "Alaska Standard Time (AKST, UTC-9)", offset: -9 },
  { label: "Alaska Daylight Time (AKDT, UTC-8)", offset: -8 },
  { label: "Hawaii-Aleutian Standard Time (HST, UTC-10)", offset: -10 },
  { label: "Greenwich Mean Time (GMT, UTC+0)", offset: 0 },
  { label: "British Summer Time (BST, UTC+1)", offset: 1 },
  { label: "Central European Time (CET, UTC+1)", offset: 1 },
  { label: "Central European Summer Time (CEST, UTC+2)", offset: 2 },
  { label: "Eastern European Time (EET, UTC+2)", offset: 2 },
  { label: "Eastern European Summer Time (EEST, UTC+3)", offset: 3 },
  { label: "Moscow Time (MSK, UTC+3)", offset: 3 },
  { label: "India Standard Time (IST, UTC+5:30)", offset: 5.5 },
  { label: "Pakistan Standard Time (PKT, UTC+5)", offset: 5 },
  { label: "Bangladesh Standard Time (BST, UTC+6)", offset: 6 },
  { label: "China Standard Time (CST, UTC+8)", offset: 8 },
  { label: "Japan Standard Time (JST, UTC+9)", offset: 9 },
  { label: "Australian Western Standard Time (AWST, UTC+8)", offset: 8 },
  { label: "Australian Central Standard Time (ACST, UTC+9:30)", offset: 9.5 },
  { label: "Australian Central Daylight Time (ACDT, UTC+10:30)", offset: 10.5 },
  { label: "Australian Eastern Standard Time (AEST, UTC+10)", offset: 10 },
  { label: "Australian Eastern Daylight Time (AEDT, UTC+11)", offset: 11 },
  { label: "New Zealand Standard Time (NZST, UTC+12)", offset: 12 },
  { label: "New Zealand Daylight Time (NZDT, UTC+13)", offset: 13 },
  { label: "Argentina Time (ART, UTC-3)", offset: -3 },
  { label: "Brazil Time (BRT, UTC-3)", offset: -3 },
  { label: "South Africa Standard Time (SAST, UTC+2)", offset: 2 },
];

export const getClockColor = (
  hours: number,
  minutes: number,
  isPMValue: boolean
) => {
  // Convert 12-hour  24-hour format
  let hours24 = hours % 12; // 12 -> 0
  if (isPMValue) hours24 += 12;

  const timeFraction = hours24 + minutes / 60; //fractional hour of the day

  const transitions = [
    { start: 0, end: 3.5, from: "#0a0a1a", to: "#1a1a33" }, // midnight
    { start: 3.5, end: 4, from: "#1a1a33", to: "#cc6600" }, // pre-sunrise
    { start: 4, end: 6, from: "#cc6600", to: "#FFD580" }, // sunrise
    { start: 6, end: 8, from: "#FFD580", to: "#ffffcc" }, // morning
    { start: 8, end: 12, from: "#ffffcc", to: "#ffff99" }, // noon
    { start: 12, end: 17, from: "#ffff99", to: "#ffbf80" }, // afternoon
    { start: 17, end: 19, from: "#ffbf80", to: "#6084a7" }, // sunset
    { start: 19, end: 21, from: "#6084a7", to: "#2c3e50" }, // dusk
    { start: 21, end: 24, from: "#2c3e50", to: "#0a0a1a" }, // late night
  ];

  //apply color for each time fraction with smooth transition
  const t =
    transitions.find(
      ({ start, end }) => timeFraction >= start && timeFraction < end
    ) || transitions[0]; // fallback

  const factor = (timeFraction - t.start) / (t.end - t.start);
  return evaluateColor(t.from, t.to, factor);
};

const evaluateColor = (color1: string, color2: string, factor: number) => {
  //convert hex to RGB
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  //get color fractions(R, G, B)
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  //evalaute each color with slight difference
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  //evalauted result
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export const calculateTimeZoneTime = (
  hours: number,
  minutes: number,
  seconds: number,
  tzOffset: number,
  isPM: boolean
) => {
  const totalMinutes = hours * 60 + minutes;
  const localOffsetMinutes = -new Date().getTimezoneOffset();
  const utcMinutes = totalMinutes - localOffsetMinutes;

  //evaluate selected time zone value
  const tzTotalMinutes = utcMinutes + tzOffset * 60;
  const tzHours = Math.floor((tzTotalMinutes / 60 + 24) % 24);
  const tzMinutes = Math.round(((tzTotalMinutes % 60) + 60) % 60);

  const localTotalMinutes = ((hours % 12) + (isPM ? 12 : 0)) * 60 + minutes; //local time in 24hr format
  const offsetMinutes = tzOffset * 60 + new Date().getTimezoneOffset(); // offset from local to selected timezone
  const tzUtcMinutes = localTotalMinutes + offsetMinutes;
  const tz24Hours = Math.floor((tzUtcMinutes + 24 * 60) / 60) % 24; //selected timezone hours in 24hr format
  const tzIsPM = tz24Hours >= 12; //am or pm

  return { tzHours, tzMinutes, tzSeconds: seconds, tzIsPM: tzIsPM };
};

export const formatTime = (
  hours: number,
  minutes: number,
  seconds: number,
  isPMOrAm: boolean
) => {
  const abbreviation = isPMOrAm ? "pm" : "am";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${abbreviation}`;
};
